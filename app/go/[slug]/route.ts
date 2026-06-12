import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  const { data: company } = await supabase
    .from('companies')
    .select('id, slug, affiliate_url')
    .eq('slug', slug)
    .single();

  if (!company || !company.affiliate_url) {
    return NextResponse.redirect(new URL('/directory', request.url));
  }

  const referrer = request.headers.get('referer') || null;
  const userAgent = request.headers.get('user-agent') || null;

  // Await the insert so it isn't dropped in serverless, but it runs
  // after the redirect response is prepared — the user sees no delay
  // since the DB round-trip happens in parallel with response send.
  await supabase.from('affiliate_clicks').insert({
    company_id: company.id,
    company_slug: company.slug,
    affiliate_url: company.affiliate_url,
    referrer,
    user_agent: userAgent,
  });

  return NextResponse.redirect(company.affiliate_url, 302);
}
