import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase, type Company, type Category, type BestOfList } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Star,
  ExternalLink,
  Award,
  Trophy,
  Medal,
  Check,
  X,
  ArrowRight,
} from 'lucide-react';

type CompanyPartial = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  short_description: string | null;
  logo_url: string | null;
  rating: number;
  review_count: number;
  is_verified: boolean;
  is_featured: boolean;
  affiliate_available: boolean;
  affiliate_url: string | null;
  website_url: string | null;
  pricing_type: string | null;
  pros: string[];
  cons: string[];
};

type BestOfCompany = {
  id: string;
  rank: number;
  blurb: string | null;
  company: CompanyPartial;
};

async function getBestOfList(slug: string) {
  const { data: list, error: listError } = await supabase
    .from('best_of_lists')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (listError || !list) return null;

  const { data: items, error: itemsError } = await supabase
    .from('best_of_items')
    .select(`
      id,
      rank,
      blurb,
      company:companies(
        id,
        name,
        slug,
        description,
        short_description,
        logo_url,
        rating,
        review_count,
        is_verified,
        is_featured,
        affiliate_available,
        affiliate_url,
        website_url,
        pricing_type,
        pros,
        cons
      )
    `)
    .eq('list_id', list.id)
    .order('rank', { ascending: true });

  if (itemsError) return { list: list as BestOfList, items: [] };

  return {
    list: list as BestOfList,
    items: (items || []).map(item => ({
      id: item.id,
      rank: item.rank,
      blurb: item.blurb,
      company: (Array.isArray(item.company) ? item.company[0] : item.company) as CompanyPartial,
    })) as BestOfCompany[],
  };
}

function getRankBadge(rank: number) {
  switch (rank) {
    case 1:
      return {
        icon: Trophy,
        color: 'bg-yellow-100 text-yellow-700 border-yellow-300',
        label: 'Best Overall',
      };
    case 2:
      return {
        icon: Medal,
        color: 'bg-slate-100 text-slate-600 border-slate-300',
        label: 'Runner Up',
      };
    case 3:
      return {
        icon: Award,
        color: 'bg-amber-100 text-amber-700 border-amber-300',
        label: 'Top Pick',
      };
    default:
      return null;
  }
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium">{rating.toFixed(1)}</span>
    </div>
  );
}

export default async function BestOfPage({ params }: { params: { slug: string } }) {
  const data = await getBestOfList(params.slug);
  if (!data) notFound();

  const { list, items } = data;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* SEO Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-6 w-6" />
            <span className="text-sm font-medium text-emerald-200">Curated List</span>
          </div>
          <h1 className="text-4xl font-bold sm:text-5xl">{list.title}</h1>
          {list.description && (
            <p className="mt-4 max-w-3xl text-lg text-emerald-100">{list.description}</p>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">
              {items.length} Companies
            </Badge>
            <Badge className="bg-white/20 text-white border-white/30 hover:bg-white/20">
              Updated {new Date(list.updated_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Nav */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 py-3 overflow-x-auto">
            {items.slice(0, 6).map((item) => (
              <a
                key={item.id}
                href={`#rank-${item.rank}`}
                className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 whitespace-nowrap"
              >
                <span className="text-slate-400">#{item.rank}</span>
                {item.company.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Company Rankings */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => {
              const badge = getRankBadge(item.rank);
              const BadgeComponent = badge?.icon;

              return (
                <Card
                  key={item.id}
                  id={`rank-${item.rank}`}
                  className={`relative overflow-hidden transition-all hover:shadow-lg ${
                    item.rank === 1 ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  {item.rank === 1 && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400" />
                  )}

                  <CardContent className="p-6">
                    <div className="flex items-start gap-6">
                      {/* Rank Badge */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`flex h-16 w-16 items-center justify-center rounded-full border-2 ${
                            badge?.color || 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}
                        >
                          <span className="text-2xl font-bold">{item.rank}</span>
                        </div>
                        {badge && BadgeComponent && (
                          <span className="mt-2 text-xs font-medium text-slate-500">
                            {badge.label}
                          </span>
                        )}
                      </div>

                      {/* Company Info */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {item.company.logo_url ? (
                              <img
                                src={item.company.logo_url}
                                alt={item.company.name}
                                className="h-12 w-12 rounded-lg object-contain"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600">
                                {item.company.name.charAt(0)}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <Link
                                  href={`/company/${item.company.slug}`}
                                  className="text-lg font-semibold text-slate-900 hover:text-emerald-600"
                                >
                                  {item.company.name}
                                </Link>
                                {item.company.is_verified && (
                                  <Badge className="bg-blue-50 text-blue-600">Verified</Badge>
                                )}
                              </div>
                              <div className="mt-1 flex items-center gap-3">
                                <StarRating rating={item.company.rating} />
                                <span className="text-sm text-slate-500">
                                  ({item.company.review_count} reviews)
                                </span>
                              </div>
                            </div>
                          </div>
                          {item.company.website_url && (
                            <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600 hidden sm:inline-flex">
                              <a
                                href={item.company.affiliate_available
                                  ? `/go/${item.company.slug}`
                                  : item.company.website_url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {item.company.affiliate_available ? 'Get Started' : 'Visit'}
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>

                        {/* Blurb */}
                        {item.blurb && (
                          <p className="mt-4 text-slate-600">{item.blurb}</p>
                        )}

                        {/* Pros & Cons */}
                        {(item.company.pros.length > 0 || item.company.cons.length > 0) && (
                          <div className="mt-4 grid gap-4 sm:grid-cols-2">
                            {item.company.pros.slice(0, 3).length > 0 && (
                              <div>
                                <ul className="space-y-1">
                                  {item.company.pros.slice(0, 3).map((pro, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                      <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                      {pro}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {item.company.cons.slice(0, 2).length > 0 && (
                              <div>
                                <ul className="space-y-1">
                                  {item.company.cons.slice(0, 2).map((con, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                      <X className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                                      {con}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Tags */}
                        <div className="mt-4 flex flex-wrap items-center gap-2">
                          {item.company.pricing_type && (
                            <Badge variant="outline" className="text-xs">
                              {item.company.pricing_type === 'freemium'
                                ? 'Freemium'
                                : item.company.pricing_type.charAt(0).toUpperCase() + item.company.pricing_type.slice(1)}
                            </Badge>
                          )}
                          {item.company.affiliate_available && (
                            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                              Affiliate Program
                            </Badge>
                          )}
                        </div>

                        {/* Mobile CTA */}
                        <div className="mt-4 sm:hidden">
                          {item.company.website_url && (
                            <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600">
                              <a
                                href={item.company.affiliate_available
                                  ? `/go/${item.company.slug}`
                                  : item.company.website_url
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {item.company.affiliate_available ? 'Get Started' : 'Visit Website'}
                                <ExternalLink className="ml-2 h-4 w-4" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Links */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
                <div className="space-y-2">
                  {items.slice(0, 5).map((item) => (
                    <a
                      key={item.id}
                      href={`#rank-${item.rank}`}
                      className="flex items-center gap-2 py-1.5 hover:text-emerald-600 text-slate-600"
                    >
                      <span className="text-xs text-slate-400 w-5">#{item.rank}</span>
                      <span className="text-sm">{item.company.name}</span>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Compare */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Compare Top Picks</h3>
                <div className="space-y-3">
                  {items.slice(0, 2).length >= 2 && (
                    <Link href={`/compare/${items[0].company.slug}-vs-${items[1].company.slug}`}>
                      <Button variant="outline" className="w-full justify-start">
                        {items[0].company.name} vs {items[1].company.name}
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                  {items.length >= 3 && (
                    <Link href="/compare">
                      <Button variant="ghost" className="w-full justify-start text-slate-600">
                        Build your own comparison
                        <ArrowRight className="ml-auto h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Related Lists */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Related Lists</h3>
                <div className="space-y-3">
                  <Link href="/best-crypto-exchanges" className="block text-sm text-emerald-600 hover:underline">
                    Best Crypto Exchanges 2026                  </Link>
                  <Link href="/best-hardware-wallets" className="block text-sm text-emerald-600 hover:underline">
                    Best Hardware Wallets 2026                  </Link>
                  <Link href="/best-crypto-tax-software" className="block text-sm text-emerald-600 hover:underline">
                    Best Crypto Tax Software
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Footer SEO Content */}
      <div className="bg-white border-t">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            How We Choose the Best {list.title.replace('Best ', '').replace(' 2026', '')}
          </h2>
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600">
              Our rankings are based on extensive research and real user reviews. We evaluate each platform
              across multiple criteria including security, fees, user experience, customer support, and
              features. Companies featured in our lists may participate in affiliate programs, which helps
              support our research.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
