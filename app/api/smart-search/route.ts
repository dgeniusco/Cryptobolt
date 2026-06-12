import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { query } = await request.json();

    if (!query) {
      return new Response(JSON.stringify({ error: 'Missing query' }), { status: 400 });
    }

    // Fetch available categories and tags
    const { data: categories } = await supabase
      .from('categories')
      .select('name, slug')
      .eq('is_active', true);

    const { data: tagData } = await supabase
      .from('companies')
      .select('tags');

    const allTags = Array.from(new Set((tagData || []).flatMap(r => r.tags || []))).slice(0, 50);

    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: `You are a search assistant for Cryptoffiliate, a crypto product directory. Given a user's natural language query, suggest filters. Always respond in this exact JSON format:
{"category_slug": "the-best-matching-category-slug-or-null", "tags": ["tag1", "tag2"], "explanation": "One sentence explaining your filter choices"}
Only use category slugs and tags from the provided lists. If nothing matches well, set category_slug to null and tags to empty array.`,
      messages: [{
        role: 'user',
        content: `User query: "${query}"

Available categories: ${JSON.stringify((categories || []).map(c => ({ slug: c.slug, name: c.name })))}
Available tags: ${JSON.stringify(allTags)}

Suggest the best filters for this query.`
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { category_slug: null, tags: [], explanation: text };
    }

    return new Response(
      JSON.stringify(parsed),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Smart search API error:', error);
    return new Response(
      JSON.stringify({ category_slug: null, tags: [], explanation: 'Unable to process query.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
