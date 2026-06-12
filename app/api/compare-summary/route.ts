import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Missing comparison slug' }), { status: 400 });
    }

    // Check cache first
    const { data: cached } = await supabase
      .from('comparison_summaries')
      .select('summary, bottom_line, generated_at')
      .eq('comparison_slug', slug)
      .single();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    if (cached && new Date(cached.generated_at) > thirtyDaysAgo) {
      return new Response(
        JSON.stringify({ summary: cached.summary, bottom_line: cached.bottom_line, cached: true }),
        { headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse slug to get company slugs
    const parts = slug.split('-vs-');
    if (parts.length !== 2) {
      return new Response(JSON.stringify({ error: 'Invalid comparison slug' }), { status: 400 });
    }

    const { data: companies, error } = await supabase
      .from('companies')
      .select('name, slug, rating, pricing_type, tags, founded_year, headquarters, pros, cons, short_description, category:categories(name)')
      .in('slug', parts);

    if (error || !companies || companies.length < 2) {
      return new Response(JSON.stringify({ error: 'Companies not found' }), { status: 404 });
    }

    const companyA = companies.find(c => c.slug === parts[0])!;
    const companyB = companies.find(c => c.slug === parts[1])!;

    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      system: `You are a neutral product comparison writer for Cryptoffiliate, a crypto directory platform. Write balanced, factual comparisons. Never give financial advice. Always respond in this exact JSON format:
{"summary": "3-4 sentence neutral summary comparing the two products and which user type each suits", "bottom_line": "A single sentence bottom-line recommendation"}`,
      messages: [{
        role: 'user',
        content: `Compare these two companies:
Company A: ${JSON.stringify({ name: companyA.name, category: (companyA.category as any)?.name, rating: companyA.rating, pricing: companyA.pricing_type, tags: companyA.tags, founded: companyA.founded_year, headquarters: companyA.headquarters, pros: companyA.pros?.slice(0,3), cons: companyA.cons?.slice(0,2) })}
Company B: ${JSON.stringify({ name: companyB.name, category: (companyB.category as any)?.name, rating: companyB.rating, pricing: companyB.pricing_type, tags: companyB.tags, founded: companyB.founded_year, headquarters: companyB.headquarters, pros: companyB.pros?.slice(0,3), cons: companyB.cons?.slice(0,2) })}

Write a balanced comparison summary.`
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { summary: text, bottom_line: '' };
    }

    // Cache the result
    await supabase.from('comparison_summaries').upsert({
      comparison_slug: slug,
      summary: parsed.summary || text,
      bottom_line: parsed.bottom_line || '',
      model: 'claude-sonnet-4-6',
    }, { onConflict: 'comparison_slug' });

    return new Response(
      JSON.stringify({ summary: parsed.summary || text, bottom_line: parsed.bottom_line || '', cached: false }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Compare summary API error:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to generate comparison summary.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
