import Link from 'next/link';
import { supabase, type Category, type Company } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Repeat, HardDrive, Smartphone, Bot, Calculator, GraduationCap, Cpu, Cloud, Users, Lock, Layers, ChartLine as LineChart, Brain, ChartBar as BarChart2, Search, Newspaper, Image, Rocket, Dice5, Trophy, CreditCard, Star, ExternalLink, ArrowRight, TrendingUp, Award, Clock, Sparkles } from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  'repeat': Repeat,
  'hard-drive': HardDrive,
  'smartphone': Smartphone,
  'bot': Bot,
  'calculator': Calculator,
  'graduation-cap': GraduationCap,
  'cpu': Cpu,
  'cloud': Cloud,
  'users': Users,
  'lock': Lock,
  'layers': Layers,
  'line-chart': LineChart,
  'brain': Brain,
  'bar-chart-2': BarChart2,
  'search': Search,
  'newspaper': Newspaper,
  'image': Image,
  'rocket': Rocket,
  'dice-5': Dice5,
  'trophy': Trophy,
  'credit-card': CreditCard,
};

async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
  return data as Category[];
}

async function getFeaturedCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .eq('is_featured', true)
    .limit(6);

  if (error) {
    console.error('Error fetching featured companies:', error);
    return [];
  }
  return data as (Company & { category: Category | null })[];
}

async function getTopRatedCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .gte('rating', 4.5)
    .order('rating', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching top rated:', error);
    return [];
  }
  return data as (Company & { category: Category | null })[];
}

async function getTrendingCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .gte('review_count', 100)
    .order('review_count', { ascending: false })
    .limit(8);

  if (error) {
    console.error('Error fetching trending:', error);
    return [];
  }
  return data as (Company & { category: Category | null })[];
}

async function getRecentCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select(`
      *,
      category:categories(id, name, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error fetching recent companies:', error);
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
            star <= Math.round(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : 'text-gray-300'
          }`}
        />
      ))}
      <span className="ml-1 text-sm font-medium text-gray-600">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default async function HomePage() {
  const [categories, featuredCompanies, topRatedCompanies, trendingCompanies, recentCompanies] = await Promise.all([
    getCategories(),
    getFeaturedCompanies(),
    getTopRatedCompanies(),
    getTrendingCompanies(),
    getRecentCompanies(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1621761191319-c6fb62004040?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-32">
          <div className="text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-emerald-400 ring-1 ring-emerald-500/20">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">Discover 14,000+ Crypto Companies</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              The Complete Directory for
              <span className="mt-2 block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Crypto Companies
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
              Compare exchanges, wallets, trading tools, tax software, and more.
              Find the best crypto companies with honest reviews from real users.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/directory">
                <Button size="lg" className="bg-emerald-500 hover:bg-emerald-600 text-white px-8">
                  Browse Directory
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/compare">
                <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-slate-800 px-8">
                  Compare Companies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="border-b bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">21+</div>
              <div className="text-sm text-slate-600">Categories</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">500+</div>
              <div className="text-sm text-slate-600">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">10K+</div>
              <div className="text-sm text-slate-600">Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-slate-900">200+</div>
              <div className="text-sm text-slate-600">Comparisons</div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Grid */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Explore by Category
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Discover companies across {categories.length} crypto categories
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon ? iconMap[category.icon] || Layers : Layers;
              return (
                <Link
                  key={category.id}
                  href={`/category/${category.slug}`}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-500 hover:shadow-lg"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 p-3 text-emerald-600 group-hover:from-emerald-100 group-hover:to-teal-100">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                    </div>
                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-emerald-500" />
                <span className="text-sm font-semibold text-emerald-600">Featured</span>
              </div>
              <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
                Top Picks This Month
              </h2>
            </div>
            <Link href="/directory?featured=true">
              <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/company/${company.slug}`}
                className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-500 hover:shadow-lg"
              >
                <div className="flex items-start gap-4">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="h-14 w-14 rounded-lg object-contain"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 text-xl font-bold text-slate-600">
                      {company.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600">
                        {company.name}
                      </h3>
                      {company.is_verified && (
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 hover:bg-blue-50">
                          Verified
                        </Badge>
                      )}
                    </div>
                    {company.category && (
                      <p className="text-sm text-slate-500">{company.category.name}</p>
                    )}
                    <div className="mt-2">
                      <StarRating rating={company.rating} />
                    </div>
                  </div>
                </div>
                {company.short_description && (
                  <p className="mt-4 text-sm text-slate-600 line-clamp-2">
                    {company.short_description}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  {company.affiliate_available && (
                    <Badge variant="outline" className="text-xs border-emerald-200 text-emerald-700">
                      Affiliate Program
                    </Badge>
                  )}
                  {company.pricing_type && (
                    <Badge variant="outline" className="text-xs">
                      {company.pricing_type === 'freemium' ? 'Freemium' :
                       company.pricing_type.charAt(0).toUpperCase() + company.pricing_type.slice(1)}
                    </Badge>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trending & Top Rated - Side by Side */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Trending */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <TrendingUp className="h-5 w-5 text-orange-500" />
                <h2 className="text-2xl font-bold text-slate-900">Trending Now</h2>
              </div>
              <div className="space-y-4">
                {trendingCompanies.slice(0, 5).map((company, index) => (
                  <Link
                    key={company.id}
                    href={`/company/${company.slug}`}
                    className="group flex items-center gap-4 rounded-lg p-3 transition-all hover:bg-slate-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 group-hover:text-emerald-600">
                          {company.name}
                        </span>
                        {company.is_verified && (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      {company.category && (
                        <p className="text-sm text-slate-500">{company.category.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <StarRating rating={company.rating} />
                      <p className="text-xs text-slate-500">{company.review_count} reviews</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Top Rated */}
            <div>
              <div className="flex items-center gap-2 mb-8">
                <Award className="h-5 w-5 text-yellow-500" />
                <h2 className="text-2xl font-bold text-slate-900">Highest Rated</h2>
              </div>
              <div className="space-y-4">
                {topRatedCompanies.slice(0, 5).map((company, index) => (
                  <Link
                    key={company.id}
                    href={`/company/${company.slug}`}
                    className="group flex items-center gap-4 rounded-lg p-3 transition-all hover:bg-slate-50"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 text-sm font-bold text-yellow-700">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-slate-900 group-hover:text-emerald-600">
                          {company.name}
                        </span>
                        {company.is_verified && (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-600 text-xs">
                            Verified
                          </Badge>
                        )}
                      </div>
                      {company.category && (
                        <p className="text-sm text-slate-500">{company.category.name}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 font-bold text-yellow-600">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {company.rating.toFixed(1)}
                      </div>
                      <p className="text-xs text-slate-500">{company.review_count} reviews</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Comparisons */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Popular Comparisons
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              See how top companies stack up against each other
            </p>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/compare/binance-vs-coinbase"
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-500 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <img
                    src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png"
                    alt="Binance"
                    className="h-12 w-12 rounded-full border-2 border-white bg-white object-contain"
                  />
                  <img
                    src="https://cryptologos.cc/logos/coinbase-coin-logo.png"
                    alt="Coinbase"
                    className="h-12 w-12 rounded-full border-2 border-white bg-white object-contain"
                  />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-600">
                    Binance vs Coinbase
                  </p>
                  <p className="text-sm text-slate-500">Crypto Exchanges</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500" />
            </Link>
            <Link
              href="/compare/ledger-nano-x-vs-trezor-model-t"
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-500 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-black text-white font-bold">
                    L
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-slate-900 text-white font-bold">
                    T
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-600">
                    Ledger vs Trezor
                  </p>
                  <p className="text-sm text-slate-500">Hardware Wallets</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500" />
            </Link>
            <Link
              href="/compare/cointracking-vs-koinly"
              className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-500 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-blue-600 text-white font-bold text-sm">
                    CT
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-emerald-600 text-white font-bold text-sm">
                    K
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-emerald-600">
                    CoinTracking vs Koinly
                  </p>
                  <p className="text-sm text-slate-500">Tax Software</p>
                </div>
              </div>
              <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500" />
            </Link>
          </div>
          <div className="mt-8 text-center">
            <Link href="/compare">
              <Button variant="outline" className="text-emerald-600 border-emerald-200 hover:bg-emerald-50">
                View all comparisons
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Best Of Lists */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900">
              Best Lists
            </h2>
            <p className="mt-4 text-lg text-slate-600">
              Curated rankings to help you find the right product
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/best-crypto-exchanges"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white"
            >
              <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10" />
              <Repeat className="mb-4 h-10 w-10" />
              <h3 className="text-xl font-bold">Best Crypto Exchanges 2024</h3>
              <p className="mt-2 text-emerald-100">Ranked by fees, security, and features</p>
              <ArrowRight className="mt-4 h-5 w-5" />
            </Link>
            <Link
              href="/best-hardware-wallets"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 p-8 text-white"
            >
              <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/5" />
              <HardDrive className="mb-4 h-10 w-10" />
              <h3 className="text-xl font-bold">Best Hardware Wallets 2024</h3>
              <p className="mt-2 text-slate-300">Secure your crypto properly</p>
              <ArrowRight className="mt-4 h-5 w-5" />
            </Link>
            <Link
              href="/best-crypto-tax-software"
              className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 p-8 text-white"
            >
              <div className="absolute right-0 top-0 -mr-8 -mt-8 h-32 w-32 rounded-full bg-white/10" />
              <Calculator className="mb-4 h-10 w-10" />
              <h3 className="text-xl font-bold">Best Crypto Tax Software</h3>
              <p className="mt-2 text-blue-100">Simplify tax season</p>
              <ArrowRight className="mt-4 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* AI Advisor CTA */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-12 sm:px-12 lg:px-16 ring-1 ring-slate-700">
            <div className="absolute right-0 top-0 opacity-5">
              <Brain className="h-64 w-64" />
            </div>
            <div className="relative">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm text-emerald-400 ring-1 ring-emerald-500/20">
                <Sparkles className="h-4 w-4" />
                AI-Powered
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Not sure which crypto product is right for you?
              </h2>
              <p className="mt-4 max-w-xl text-slate-400">
                Our AI advisor analyzes your experience, goals, and budget to recommend the best crypto products from our directory.
              </p>
              <Link href="/advisor">
                <Button size="lg" className="mt-6 bg-emerald-500 hover:bg-emerald-600">
                  <Brain className="mr-2 h-5 w-5" />
                  Try AI Advisor
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Added */}
      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-slate-500" />
              <h2 className="text-2xl font-bold text-slate-900">Recently Added</h2>
            </div>
            <Link href="/directory?sort=newest">
              <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700">
                View all
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentCompanies.map((company) => (
              <Link
                key={company.id}
                href={`/company/${company.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-500 hover:shadow-lg"
              >
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="h-12 w-12 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-slate-100 to-slate-50 text-lg font-bold text-slate-600">
                    {company.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600">
                    {company.name}
                  </h3>
                  {company.category && (
                    <p className="text-sm text-slate-500">{company.category.name}</p>
                  )}
                </div>
                <Badge variant="outline" className="text-xs">
                  New
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-12 sm:px-12 lg:px-16">
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-20">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white" />
              <div className="absolute -bottom-20 -right-40 h-96 w-96 rounded-full bg-white" />
            </div>
            <div className="relative">
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to grow your crypto business?
              </h2>
              <p className="mt-4 max-w-xl text-emerald-100">
                List your company on Cryptoffiliate and reach thousands of crypto enthusiasts looking for your services.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link href="/submit">
                  <Button size="lg" className="bg-white text-emerald-600 hover:bg-emerald-50">
                    Submit Your Company
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/advertise">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-emerald-700">
                    Advertise With Us
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <footer className="border-t bg-slate-900 py-12 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="text-xl font-bold">Cryptoffiliate</div>
              <p className="mt-4 text-slate-400">
                The comprehensive cryptocurrency directory and discovery platform.
                Compare exchanges, wallets, trading tools, and more.
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Quick Links</h3>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li><Link href="/directory" className="hover:text-white">Directory</Link></li>
                <li><Link href="/compare" className="hover:text-white">Compare</Link></li>
                <li><Link href="/best-crypto-exchanges" className="hover:text-white">Best Lists</Link></li>
                <li><Link href="/submit" className="hover:text-white">Submit Company</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-slate-400">
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-800 pt-8 text-center text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Cryptoffiliate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
