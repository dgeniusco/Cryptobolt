import Link from 'next/link';
import { supabase, type Category, type Company } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, Grid3x3 as Grid3X3, Repeat, HardDrive, Smartphone, Bot, Calculator, GraduationCap, Cpu, Cloud, Users, Lock, Layers, ChartLine as LineChart, Brain, ChartBar as BarChart2, Image, Rocket, Dice5, Trophy, CreditCard, Newspaper } from 'lucide-react';
import SmartSearch from '@/components/smart-search';

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

async function getAllData() {
  const [categoriesResult, companiesResult, countsResult] = await Promise.all([
    supabase.from('categories').select('*').eq('is_active', true).order('order_index'),
    supabase.from('companies').select('id, name, slug, logo_url, rating, review_count, is_featured, category_id, is_verified, created_at').order('created_at', { ascending: false }),
    supabase.rpc('get_category_counts'),
  ]);

  const categoryCountMap: Record<string, number> = {};
  if (countsResult.data) {
    for (const row of countsResult.data as { category_id: string; count: number }[]) {
      categoryCountMap[row.category_id] = row.count;
    }
  }

  return {
    categories: categoriesResult.data as Category[],
    companies: companiesResult.data as Company[],
    categoryCounts: categoryCountMap,
  };
}

export default async function DirectoryPage() {
  const { categories, companies, categoryCounts } = await getAllData();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold sm:text-5xl">Company Directory</h1>
            <p className="mt-4 text-lg text-slate-300">
              Browse {Object.values(categoryCounts).reduce((a: number, b: number) => a + b, 0)} companies across {categories.length} categories
            </p>
          </div>

          {/* Search */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search companies, categories..."
                className="w-full rounded-xl border border-slate-700 bg-slate-800/50 py-4 pl-12 pr-4 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* AI Smart Search */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-slate-900">Ask AI</h2>
          </div>
          <SmartSearch />
        </div>

        {/* Categories Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">All Categories</h2>
            <Badge variant="outline" className="text-emerald-700 border-emerald-200 bg-emerald-50">
              {categories.length} categories
            </Badge>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon ? iconMap[category.icon] || Grid3X3 : Grid3X3;
              const companyCount = categoryCounts[category.id] || 0;

              return (
                <Link
                  key={category.id}
                  href={`/directory/${category.slug}`}
                  className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-all hover:border-emerald-500 hover:shadow-lg"
                >
                  <div className="rounded-lg bg-gradient-to-br from-emerald-50 to-teal-50 p-3 text-emerald-600">
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 group-hover:text-emerald-600">
                      {category.name}
                    </h3>
                    <p className="text-sm text-slate-500">{companyCount} {companyCount === 1 ? 'company' : 'companies'}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Featured Companies */}
        <div className="mb-16">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Featured Companies</h2>
            <Link href="/directory?featured=true">
              <Button variant="ghost" className="text-emerald-600">
                View All
              </Button>
            </Link>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {companies.filter(c => c.is_featured).slice(0, 8).map((company) => (
              <Link
                key={company.id}
                href={`/company/${company.slug}`}
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all hover:border-emerald-500 hover:shadow-lg"
              >
                <div className="p-5">
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
                  <h3 className="mt-3 font-semibold text-slate-900 group-hover:text-emerald-600">
                    {company.name}
                  </h3>
                  <div className="mt-2 flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`h-4 w-4 ${
                          i < Math.round(company.rating || 0)
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                        }`}
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm text-slate-600">
                      {company.rating?.toFixed(1) || 'N/A'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recently Added */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-900">Recently Added</h2>
          </div>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {companies.slice(0, 6).map((company) => (
              <Link
                key={company.id}
                href={`/company/${company.slug}`}
                className="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-emerald-500"
              >
                {company.logo_url ? (
                  <img
                    src={company.logo_url}
                    alt={company.name}
                    className="h-12 w-12 rounded-lg object-contain"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-100 text-lg font-bold text-slate-600">
                    {company.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-slate-900 group-hover:text-emerald-600">
                      {company.name}
                    </h3>
                    {company.is_verified && (
                      <Badge variant="secondary" className="text-xs bg-blue-50 text-blue-600">
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {company.review_count || 0} reviews
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
