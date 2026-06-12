import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase, type Company, type Category } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Star,
  ExternalLink,
  Check,
  X,
  ArrowLeft,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import AIComparisonSummary from '@/components/ai-comparison-summary';

async function getComparison(slug: string) {
  // Parse slug like "binance-vs-coinbase"
  const parts = slug.split('-vs-');
  if (parts.length !== 2) return null;

  const slugA = parts[0];
  const slugB = parts[1];

  const { data: companies, error } = await supabase
    .from('companies')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .in('slug', [slugA, slugB]);

  if (error || !companies || companies.length < 2) return null;

  return {
    companyA: companies.find(c => c.slug === slugA) as Company & { category: Category | null },
    companyB: companies.find(c => c.slug === slugB) as Company & { category: Category | null },
  };
}

const compareFields = [
  { label: 'Rating', key: 'rating', type: 'rating' as const },
  { label: 'Reviews', key: 'review_count', type: 'number' as const },
  { label: 'Pricing', key: 'pricing_type', type: 'pricing' as const },
  { label: 'Affiliate Program', key: 'affiliate_available', type: 'boolean' as const },
  { label: 'Verified', key: 'is_verified', type: 'boolean' as const },
  { label: 'Founded', key: 'founded_year', type: 'number' as const },
  { label: 'Headquarters', key: 'headquarters', type: 'text' as const },
];

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
    </div>
  );
}

export default async function ComparePage({ params }: { params: { slug: string } }) {
  const comparison = await getComparison(params.slug);
  if (!comparison) notFound();

  const { companyA, companyB } = comparison;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/compare" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
            <ArrowLeft className="h-4 w-4" />
            Back to Comparisons
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            {companyA.name} vs {companyB.name}
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            Compare these {companyA.category?.name.toLowerCase() || 'companies'} side by side
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid gap-6 lg:grid-cols-2 mb-12">
          {/* Company A */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500" />
            <CardContent className="pt-8">
              <div className="flex items-center gap-4 mb-6">
                {companyA.logo_url ? (
                  <img src={companyA.logo_url} alt={companyA.name} className="h-16 w-16 rounded-xl object-contain" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-2xl font-bold text-slate-600">
                    {companyA.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-900">{companyA.name}</h2>
                    {companyA.is_verified && (
                      <Badge className="bg-blue-50 text-blue-600">Verified</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating rating={companyA.rating} />
                    <span className="text-sm text-slate-500">{companyA.rating.toFixed(1)} ({companyA.review_count} reviews)</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6">{companyA.short_description}</p>

              {companyA.website_url && (
                <Button asChild className="w-full bg-emerald-500 hover:bg-emerald-600">
                  <a href={companyA.website_url} target="_blank" rel="noopener noreferrer">
                    Visit {companyA.name}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Company B */}
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-blue-500" />
            <CardContent className="pt-8">
              <div className="flex items-center gap-4 mb-6">
                {companyB.logo_url ? (
                  <img src={companyB.logo_url} alt={companyB.name} className="h-16 w-16 rounded-xl object-contain" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-2xl font-bold text-slate-600">
                    {companyB.name.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-bold text-slate-900">{companyB.name}</h2>
                    {companyB.is_verified && (
                      <Badge className="bg-blue-50 text-blue-600">Verified</Badge>
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-2">
                    <StarRating rating={companyB.rating} />
                    <span className="text-sm text-slate-500">{companyB.rating.toFixed(1)} ({companyB.review_count} reviews)</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6">{companyB.short_description}</p>

              {companyB.website_url && (
                <Button asChild className="w-full bg-blue-500 hover:bg-blue-600">
                  <a href={companyB.website_url} target="_blank" rel="noopener noreferrer">
                    Visit {companyB.name}
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Comparison Table */}
        <Card>
          <CardHeader>
            <CardTitle>Detailed Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="py-3 px-4 text-left text-sm font-medium text-slate-500">Feature</th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-slate-900">{companyA.name}</th>
                    <th className="py-3 px-4 text-center text-sm font-medium text-slate-900">{companyB.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {compareFields.map((field) => {
                    const valueA = companyA[field.key as keyof Company];
                    const valueB = companyB[field.key as keyof Company];

                    let displayA: React.ReactNode;
                    let displayB: React.ReactNode;
                    let winner: 'a' | 'b' | 'tie' | null = null;

                    switch (field.type) {
                      case 'rating':
                        displayA = <StarRating rating={valueA as number} />;
                        displayB = <StarRating rating={valueB as number} />;
                        winner = (valueA as number) > (valueB as number) ? 'a' : (valueA as number) < (valueB as number) ? 'b' : 'tie';
                        break;
                      case 'number':
                        displayA = valueA?.toString() || 'N/A';
                        displayB = valueB?.toString() || 'N/A';
                        if (field.key === 'rating' || field.key === 'review_count') {
                          winner = (valueA as number) > (valueB as number) ? 'a' : (valueA as number) < (valueB as number) ? 'b' : 'tie';
                        }
                        break;
                      case 'pricing':
                        displayA = valueA ? (valueA as string).charAt(0).toUpperCase() + (valueA as string).slice(1) : 'Unknown';
                        displayB = valueB ? (valueB as string).charAt(0).toUpperCase() + (valueB as string).slice(1) : 'Unknown';
                        break;
                      case 'boolean':
                        displayA = valueA ? <ThumbsUp className="h-5 w-5 text-emerald-500" /> : <ThumbsDown className="h-5 w-5 text-slate-300" />;
                        displayB = valueB ? <ThumbsUp className="h-5 w-5 text-emerald-500" /> : <ThumbsDown className="h-5 w-5 text-slate-300" />;
                        break;
                      case 'text':
                      default:
                        displayA = String(valueA || 'N/A');
                        displayB = String(valueB || 'N/A');
                        break;
                    }

                    return (
                      <tr key={field.key} className="border-b last:border-0">
                        <td className="py-4 px-4 text-sm font-medium text-slate-700">{field.label}</td>
                        <td className={`py-4 px-4 text-center ${winner === 'a' ? 'bg-emerald-50' : ''}`}>
                          {displayA}
                        </td>
                        <td className={`py-4 px-4 text-center ${winner === 'b' ? 'bg-blue-50' : ''}`}>
                          {displayB}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Pros & Cons Comparison */}
        <div className="grid gap-6 lg:grid-cols-2 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>{companyA.name} Pros & Cons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-emerald-700 mb-2">Pros</h4>
                  <ul className="space-y-1">
                    {companyA.pros.length > 0 ? companyA.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {pro}
                      </li>
                    )) : (
                      <li className="text-sm text-slate-400">No pros listed</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Cons</h4>
                  <ul className="space-y-1">
                    {companyA.cons.length > 0 ? companyA.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        {con}
                      </li>
                    )) : (
                      <li className="text-sm text-slate-400">No cons listed</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{companyB.name} Pros & Cons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-emerald-700 mb-2">Pros</h4>
                  <ul className="space-y-1">
                    {companyB.pros.length > 0 ? companyB.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        {pro}
                      </li>
                    )) : (
                      <li className="text-sm text-slate-400">No pros listed</li>
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-red-700 mb-2">Cons</h4>
                  <ul className="space-y-1">
                    {companyB.cons.length > 0 ? companyB.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        {con}
                      </li>
                    )) : (
                      <li className="text-sm text-slate-400">No cons listed</li>
                    )}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Verdict */}
        <div className="mt-8">
          <AIComparisonSummary slug={params.slug} />
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-slate-600 mb-4">Can't decide? Check out more options in the directory.</p>
          <Link href={`/category/${companyA.category?.slug || companyB.category?.slug}`}>
            <Button variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
              View All {companyA.category?.name || 'Companies'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
