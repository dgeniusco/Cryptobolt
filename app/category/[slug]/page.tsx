import { notFound } from 'next/navigation';
import Link from 'next/link';
import { supabase, type Category, type Company, type Subcategory } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Star, ArrowLeft, ExternalLink, MapPin, DollarSign } from 'lucide-react';

type FilterParams = {
  pricing?: string;
  affiliate?: string;
  verified?: string;
  sort?: string;
};

async function getCategory(slug: string) {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single();

  if (error || !data) return null;
  return data as Category;
}

async function getSubcategories(categoryId: string) {
  const { data, error } = await supabase
    .from('subcategories')
    .select('*')
    .eq('category_id', categoryId)
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) return [];
  return data as Subcategory[];
}

async function getCompanies(categoryId: string, filters: FilterParams, subcategoryId?: string) {
  let query = supabase
    .from('companies')
    .select(`*, category:categories(id, name, slug)`)
    .eq('category_id', categoryId);

  if (subcategoryId) {
    query = query.eq('subcategory_id', subcategoryId);
  }

  if (filters.pricing && filters.pricing !== 'all') {
    query = query.eq('pricing_type', filters.pricing);
  }

  if (filters.affiliate === 'true') {
    query = query.eq('affiliate_available', true);
  }

  if (filters.verified === 'true') {
    query = query.eq('is_verified', true);
  }

  // Sorting
  switch (filters.sort) {
    case 'rating':
      query = query.order('rating', { ascending: false });
      break;
    case 'reviews':
      query = query.order('review_count', { ascending: false });
      break;
    case 'newest':
      query = query.order('created_at', { ascending: false });
      break;
    case 'name':
      query = query.order('name', { ascending: true });
      break;
    default:
      query = query.order('is_featured', { ascending: false }).order('rating', { ascending: false });
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching companies:', error);
    return [];
  }
  return data as (Company & { category: Category | null })[];
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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const category = await getCategory(params.slug);
  if (!category) notFound();

  const filters: FilterParams = {
    pricing: typeof searchParams.pricing === 'string' ? searchParams.pricing : 'all',
    affiliate: typeof searchParams.affiliate === 'string' ? searchParams.affiliate : undefined,
    verified: typeof searchParams.verified === 'string' ? searchParams.verified : undefined,
    sort: typeof searchParams.sort === 'string' ? searchParams.sort : 'featured',
  };

  const subcatSlug = typeof searchParams.subcategory === 'string' ? searchParams.subcategory : undefined;

  const [subcategories, companies] = await Promise.all([
    getSubcategories(category.id),
    getCompanies(category.id, filters, subcatSlug),
  ]);

  const selectedSubcategory = subcatSlug
    ? subcategories.find(s => s.slug === subcatSlug)
    : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <Link
            href="/directory"
            className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Directory
          </Link>
          <h1 className="text-3xl font-bold sm:text-4xl">{category.name}</h1>
          {category.description && (
            <p className="mt-3 max-w-2xl text-slate-300">{category.description}</p>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Sidebar Filters */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="sticky top-4 space-y-6 rounded-lg bg-white p-6 shadow-sm">
              <div>
                <h3 className="font-semibold text-slate-900">Sort By</h3>
                <div className="mt-3">
                  <Select name="sort" defaultValue={filters.sort || 'featured'}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="featured">Featured</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                      <SelectItem value="reviews">Most Reviews</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="name">Name (A-Z)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {subcategories.length > 0 && (
                <div>
                  <h3 className="font-semibold text-slate-900">Subcategory</h3>
                  <div className="mt-3 space-y-2">
                    <Link
                      href={`/category/${category.slug}`}
                      className={`block rounded-md px-3 py-2 text-sm ${
                        !selectedSubcategory
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      All {category.name}
                    </Link>
                    {subcategories.map((sub) => (
                      <Link
                        key={sub.id}
                        href={`/category/${category.slug}?subcategory=${sub.slug}`}
                        className={`block rounded-md px-3 py-2 text-sm ${
                          selectedSubcategory?.slug === sub.slug
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-slate-900">Pricing</h3>
                <div className="mt-3 space-y-2">
                  <Link
                    href={`/category/${category.slug}${selectedSubcategory ? `?subcategory=${selectedSubcategory.slug}` : ''}`}
                    className={`block rounded-md px-3 py-2 text-sm ${
                      filters.pricing === 'all' || !filters.pricing
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    All
                  </Link>
                  <Link
                    href={`/category/${category.slug}?pricing=free${selectedSubcategory ? `&subcategory=${selectedSubcategory.slug}` : ''}`}
                    className={`block rounded-md px-3 py-2 text-sm ${
                      filters.pricing === 'free'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Free
                  </Link>
                  <Link
                    href={`/category/${category.slug}?pricing=freemium${selectedSubcategory ? `&subcategory=${selectedSubcategory.slug}` : ''}`}
                    className={`block rounded-md px-3 py-2 text-sm ${
                      filters.pricing === 'freemium'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Freemium
                  </Link>
                  <Link
                    href={`/category/${category.slug}?pricing=paid${selectedSubcategory ? `&subcategory=${selectedSubcategory.slug}` : ''}`}
                    className={`block rounded-md px-3 py-2 text-sm ${
                      filters.pricing === 'paid'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Paid
                  </Link>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-900">Filters</h3>
                <div className="mt-3 space-y-2">
                  <Link
                    href={`/category/${category.slug}?affiliate=true${selectedSubcategory ? `&subcategory=${selectedSubcategory.slug}` : ''}${filters.pricing && filters.pricing !== 'all' ? `&pricing=${filters.pricing}` : ''}`}
                    className={`block rounded-md px-3 py-2 text-sm ${
                      filters.affiliate === 'true'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Affiliate Program
                  </Link>
                  <Link
                    href={`/category/${category.slug}?verified=true${selectedSubcategory ? `&subcategory=${selectedSubcategory.slug}` : ''}${filters.pricing && filters.pricing !== 'all' ? `&pricing=${filters.pricing}` : ''}`}
                    className={`block rounded-md px-3 py-2 text-sm ${
                      filters.verified === 'true'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Verified Only
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Company List */}
          <div className="flex-1">
            {selectedSubcategory && (
              <div className="mb-4">
                <Badge className="bg-emerald-100 text-emerald-700">
                  {selectedSubcategory.name}
                  <Link
                    href={`/category/${category.slug}`}
                    className="ml-2 hover:text-emerald-900"
                  >
                    &times;
                  </Link>
                </Badge>
              </div>
            )}

            <p className="mb-6 text-sm text-slate-600">
              Showing {companies.length} companies
            </p>

            {companies.length === 0 ? (
              <div className="rounded-lg bg-white p-12 text-center shadow-sm">
                <p className="text-slate-500">No companies found matching your criteria.</p>
                <Link
                  href={`/category/${category.slug}`}
                  className="mt-4 inline-block text-emerald-600 hover:underline"
                >
                  Clear all filters
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {companies.map((company) => (
                  <Link
                    key={company.id}
                    href={`/company/${company.slug}`}
                    className="group block rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-500 hover:shadow-lg"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className="h-16 w-16 rounded-lg object-contain"
                        />
                      ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 text-2xl font-bold text-slate-600">
                          {company.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-600">
                            {company.name}
                          </h3>
                          {company.is_verified && (
                            <Badge className="bg-blue-50 text-blue-600 hover:bg-blue-50">
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
                          <p className="mt-1 text-sm text-slate-600">
                            {company.short_description}
                          </p>
                        )}
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                          <StarRating rating={company.rating} />
                          <span className="text-sm text-slate-500">
                            ({company.review_count} reviews)
                          </span>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {company.pricing_type && (
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="mr-1 h-3 w-3" />
                              {company.pricing_type === 'freemium'
                                ? 'Freemium'
                                : company.pricing_type.charAt(0).toUpperCase() +
                                  company.pricing_type.slice(1)}
                            </Badge>
                          )}
                          {company.affiliate_available && (
                            <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                              Affiliate Program
                            </Badge>
                          )}
                          {company.countries_supported.slice(0, 3).map((country) => (
                            <Badge key={country} variant="outline" className="text-xs">
                              <MapPin className="mr-1 h-3 w-3" />
                              {country}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 sm:flex-col">
                        {company.website_url && (
                          <Button asChild size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                            <a
                              href={company.affiliate_available ? `/go/${company.slug}` : company.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="mr-1 h-4 w-4" />
                              Visit
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
