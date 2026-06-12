import Anthropic from '@anthropic-ai/sdk';
import { supabase } from '@/lib/supabase';

const SYSTEM_PROMPT = `You are a crypto product advisor for Cryptoffiliate, a cryptocurrency directory platform. Based on the user's profile and the provided list of companies, recommend 2-3 best-fit companies.

RULES:
- ONLY recommend companies from the provided list. Never suggest companies not in the list.
- For each recommendation, explain why it fits the user's profile in 1-2 sentences.
- Note any tradeoffs or limitations.
- Be neutral and factual. Never make financial advice claims.
- Format your response as JSON with this exact structure:
{
  "recommendations": [
    {
      "company_slug": "slug-here",
      "reason": "Why this fits the user",
      "tradeoff": "Any limitation to be aware of"
    }
  ],
  "summary": "A brief 1-2 sentence overall recommendation summary"
}

If no companies match well, say so honestly and suggest the closest alternatives.`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { experience, goal, budget, country } = body;

    // Fetch approved companies relevant to the user's goal
    const { data: companies, error } = await supabase
      .from('companies')
      .select('slug, name, short_description, category:categories(name, slug), pricing_type, rating, pros, cons, affiliate_available, countries_supported, tags')
      .limit(50);

    if (error) {
      return new Response(JSON.stringify({ error: 'Failed to fetch companies' }), { status: 500 });
    }

    const companyList = (companies || []).map(c => {
      const cat = Array.isArray(c.category) ? c.category[0] : c.category;
      return {
        slug: c.slug,
        name: c.name,
        short_description: c.short_description,
        category: cat?.name,
        pricing_type: c.pricing_type,
        rating: c.rating,
        pros: c.pros?.slice(0, 3),
        cons: c.cons?.slice(0, 2),
        countries_supported: c.countries_supported,
        tags: c.tags,
      };
    });

    const userMessage = `User profile:
- Experience level: ${experience}
- Primary goal: ${goal}
- Budget: ${budget || 'Not specified'}
- Country: ${country || 'Not specified'}

Available companies:
${JSON.stringify(companyList, null, 2)}

Recommend the best 2-3 companies for this user.`;

    const anthropic = new Anthropic();

    const stream = anthropic.messages.stream({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Advisor API error:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to generate recommendations. Please try again.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
