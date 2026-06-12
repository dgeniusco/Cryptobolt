import Anthropic from '@anthropic-ai/sdk';

export async function POST(request: Request) {
  try {
    const { companyName, website, category } = await request.json();

    if (!companyName) {
      return new Response(JSON.stringify({ error: 'Missing company name' }), { status: 400 });
    }

    const anthropic = new Anthropic();

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 256,
      system: `You are a neutral, factual product description writer for Cryptoffiliate, a cryptocurrency directory platform. Write concise, factual descriptions suitable for a directory listing. Do not make marketing claims. Do not give financial advice. Output only the description text, no JSON, no quotes, no prefix.`,
      messages: [{
        role: 'user',
        content: `Write a 2-3 sentence neutral, factual description for a directory listing:
- Company: ${companyName}
${website ? `- Website: ${website}` : ''}
${category ? `- Category: ${category}` : ''}

The description should be informative and suitable for a product comparison directory.`
      }],
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';

    return new Response(
      JSON.stringify({ description: text.trim() }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Generate description API error:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to generate description.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
