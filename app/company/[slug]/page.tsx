import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase, type Company, type Category, type Review } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Star,
  ExternalLink,
  MapPin,
  Calendar,
  Globe,
  Twitter,
  Linkedin,
  MessageCircle,
  Check,
  X,
  Share2,
  Bookmark,
  ThumbsUp,
  ArrowLeft,
} from 'lucide-react';

async function getCompanyBySlug(slug: string) {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      category:categories(id, name, slug),
      subcategory:subcategories(id, name, slug)
    `)
    .eq('slug', slug)
    .single();

  if (error || !data) return null;
  return data as Company & {
    category: Category | null;
    subcategory: { id: string; name: string; slug: string } | null;
  };
}

async function getCompanyReviews(companyId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('company_id', companyId)
    .eq('is_approved', true)
    .order('helpful_count', { ascending: false })
    .limit(10);

  if (error) return [];
  return data as Review[];
}

async function getRelatedCompanies(categoryId: string, excludeId: string) {
  const { data, error } = await supabase
    .from('companies')
    .select('id, name, slug, logo_url, rating, short_description')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .limit(4);

  if (error) return [];
  return data as Pick<Company, 'id' | 'name' | 'slug' | 'logo_url' | 'rating' | 'short_description'>[];
}

function StarRating({ rating, size = 'md' }: { rating: number; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClass = size === 'sm' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-5 w-5';
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= Math.round(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export default async function CompanyPage({ params }: { params: { slug: string } }) {
  const company = await getCompanyBySlug(params.slug);
  if (!company) notFound();

  const [reviews, relatedCompanies] = await Promise.all([
    getCompanyReviews(company.id),
    company.category ? getRelatedCompanies(company.category.id, company.id) : Promise.resolve([]),
  ]);

  const avgRating = company.rating;
  const ratingDistribution = [5, 4, 3, 2, 1].map((stars) => {
    const count = reviews.filter((r) => r.rating === stars).length;
    const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
    return { stars, count, percentage };
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-700">Home</Link>
            <span>/</span>
            <Link href="/directory" className="hover:text-slate-700">Directory</Link>
            <span>/</span>
            {company.category && (
              <>
                <Link href={`/category/${company.category.slug}`} className="hover:text-slate-700">
                  {company.category.name}
                </Link>
                <span>/</span>
              </>
            )}
            <span className="text-slate-900">{company.name}</span>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white border-b">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-6">
              {company.logo_url ? (
                <img
                  src={company.logo_url}
                  alt={company.name}
                  className="h-20 w-20 rounded-xl object-contain border border-slate-200 bg-white p-2"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 text-3xl font-bold text-slate-600">
                  {company.name.charAt(0)}
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl font-bold text-slate-900">{company.name}</h1>
                  {company.is_verified && (
                    <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                      <Check className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  {company.is_featured && (
                    <Badge className="bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                      Featured
                    </Badge>
                  )}
                </div>
                {company.short_description && (
                  <p className="mt-2 text-lg text-slate-600">{company.short_description}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <StarRating rating={avgRating} />
                    <span className="font-semibold text-slate-900">{avgRating.toFixed(1)}</span>
                    <span className="text-slate-500">({company.review_count} reviews)</span>
                  </div>
                  {company.pricing_type && (
                    <Badge variant="outline" className="text-slate-600">
                      {company.pricing_type === 'freemium'
                        ? 'Freemium'
                        : company.pricing_type.charAt(0).toUpperCase() + company.pricing_type.slice(1)}
                    </Badge>
                  )}
                  {company.founded_year && (
                    <span className="text-sm text-slate-500">
                      Founded {company.founded_year}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              {company.website_url && (
                <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                  <a href={company.website_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Visit Website
                  </a>
                </Button>
              )}
              {company.affiliate_available && company.affiliate_url && (
                <Button asChild variant="outline" className="border-emerald-500 text-emerald-600 hover:bg-emerald-50">
                  <a href={company.affiliate_url} target="_blank" rel="noopener noreferrer sponsored">
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Get Started
                  </a>
                </Button>
              )}
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="w-full justify-start bg-white border-b rounded-none h-auto p-0">
                <TabsTrigger value="overview" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500">
                  Reviews ({company.review_count})
                </TabsTrigger>
                <TabsTrigger value="pricing" className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500">
                  Pricing
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>About {company.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-600 leading-relaxed">
                      {company.description || company.short_description || 'No description available.'}
                    </p>

                    {/* Pros and Cons */}
                    {(company.pros.length > 0 || company.cons.length > 0) && (
                      <div className="mt-8 grid gap-6 md:grid-cols-2">
                        {company.pros.length > 0 && (
                          <div>
                            <h3 className="flex items-center gap-2 font-semibold text-emerald-700 mb-3">
                              <Check className="h-5 w-5" />
                              Pros
                            </h3>
                            <ul className="space-y-2">
                              {company.pros.map((pro, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                  <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                                  {pro}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {company.cons.length > 0 && (
                          <div>
                            <h3 className="flex items-center gap-2 font-semibold text-red-700 mb-3">
                              <X className="h-5 w-5" />
                              Cons
                            </h3>
                            <ul className="space-y-2">
                              {company.cons.map((con, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                  <X className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                                  {con}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Tags */}
                    {company.tags.length > 0 && (
                      <div className="mt-8">
                        <h3 className="font-semibold text-slate-900 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {company.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    {reviews.length > 0 ? (
                      <div className="space-y-6">
                        {reviews.map((review) => (
                          <div key={review.id} className="border-b pb-6 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium text-slate-900">
                                    {review.author_name}
                                  </span>
                                  {review.is_verified_purchase && (
                                    <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200">
                                      Verified Purchase
                                    </Badge>
                                  )}
                                </div>
                                <div className="mt-1 flex items-center gap-2">
                                  <StarRating rating={review.rating} size="sm" />
                                  <span className="text-xs text-slate-500">
                                    {new Date(review.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                              <Button variant="ghost" size="sm" className="text-slate-500">
                                <ThumbsUp className="h-4 w-4 mr-1" />
                                {review.helpful_count}
                              </Button>
                            </div>
                            {review.title && (
                              <h4 className="mt-2 font-medium text-slate-900">{review.title}</h4>
                            )}
                            {review.content && (
                              <p className="mt-2 text-sm text-slate-600">{review.content}</p>
                            )}
                            {(review.pros.length > 0 || review.cons.length > 0) && (
                              <div className="mt-3 flex flex-wrap gap-4">
                                {review.pros.map((pro) => (
                                  <span key={pro} className="text-xs text-emerald-600">
                                    + {pro}
                                  </span>
                                ))}
                                {review.cons.map((con) => (
                                  <span key={con} className="text-xs text-red-600">
                                    - {con}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-slate-500">No reviews yet. Be the first to review!</p>
                        <Button className="mt-4" variant="outline">Write a Review</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="pricing" className="mt-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-12">
                      <p className="text-lg font-medium text-slate-900">
                        {company.pricing_type === 'free'
                          ? 'Free to Use'
                          : company.pricing_type === 'freemium'
                          ? 'Freemium Model'
                          : company.pricing_type === 'paid'
                          ? 'Paid Product'
                          : 'Enterprise Solution'}
                      </p>
                      {company.pricing_details && (
                        <p className="mt-2 text-slate-500">{company.pricing_details}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Info Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                {company.headquarters && (
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Headquarters</p>
                      <p className="font-medium text-slate-900">{company.headquarters}</p>
                    </div>
                  </div>
                )}
                {company.founded_year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-slate-400" />
                    <div>
                      <p className="text-xs text-slate-500">Founded</p>
                      <p className="font-medium text-slate-900">{company.founded_year}</p>
                    </div>
                  </div>
                )}
                {company.countries_supported.length > 0 && (
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-500">Available In</p>
                      <p className="font-medium text-slate-900">
                        {company.countries_supported.slice(0, 5).join(', ')}
                        {company.countries_supported.length > 5 && '...'}
                      </p>
                    </div>
                  </div>
                )}
                {company.affiliate_available && (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                    <p className="text-sm font-medium text-emerald-800">Affiliate Program</p>
                    {company.affiliate_commission && (
                      <p className="mt-1 text-xs text-emerald-600">
                        Commission: {company.affiliate_commission}
                      </p>
                    )}
                    <Button size="sm" className="mt-3 w-full bg-emerald-600 hover:bg-emerald-700">
                      Join Program
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Social Links */}
            {(company.twitter_url || company.linkedin_url || company.discord_url || company.telegram_url || company.reddit_url || company.github_url) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Social Links</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-2">
                  {company.twitter_url && (
                    <a href={company.twitter_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 hover:bg-slate-200">
                      <Twitter className="h-4 w-4" />Twitter
                    </a>
                  )}
                  {company.linkedin_url && (
                    <a href={company.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600 hover:bg-slate-200">
                      <Linkedin className="h-4 w-4" />LinkedIn
                    </a>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Related Companies */}
            {relatedCompanies.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Similar Companies</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {relatedCompanies.map((related) => (
                    <Link
                      key={related.id}
                      href={`/company/${related.slug}`}
                      className="flex items-center gap-3 rounded-lg p-2 hover:bg-slate-50"
                    >
                      {related.logo_url ? (
                        <img src={related.logo_url} alt={related.name} className="h-10 w-10 rounded object-contain" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-slate-100 font-bold text-slate-600">
                          {related.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-slate-900 truncate">{related.name}</p>
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs text-slate-500">{related.rating?.toFixed(1)}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
