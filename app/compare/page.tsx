import Link from 'next/link';
import { supabase, type Comparison, type Company, type Category } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, GitCompare, Repeat, HardDrive, Calculator, Bot } from 'lucide-react';

const categoryComparisons = [
  { category: 'Crypto Exchanges', slug: 'crypto-exchanges', icon: Repeat, comparisons: ['binance-vs-coinbase'] },
  { category: 'Hardware Wallets', slug: 'hardware-wallets', icon: HardDrive, comparisons: ['ledger-nano-x-vs-trezor-model-t'] },
  { category: 'Crypto Tax Software', slug: 'crypto-tax-software', icon: Calculator, comparisons: ['cointracking-vs-koinly'] },
  { category: 'Trading Bots', slug: 'trading-bots', icon: Bot, comparisons: [] },
];

export default async function CompareIndexPage() {
  const { data: comparisons } = await supabase
    .from('comparisons')
    .select('*')
    .order('view_count', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <GitCompare className="mx-auto h-12 w-12 text-emerald-400 mb-4" />
            <h1 className="text-4xl font-bold sm:text-5xl">Compare Companies</h1>
            <p className="mt-4 text-lg text-slate-300">
              Side-by-side comparisons to help you make the right choice
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Popular Comparisons by Category */}
        <div className="space-y-12">
          {categoryComparisons.map((cat) => {
            const Icon = cat.icon;
            return (
              <section key={cat.slug}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-100 p-2">
                      <Icon className="h-5 w-5 text-emerald-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">{cat.category}</h2>
                  </div>
                  <Link href={`/compare?category=${cat.slug}`}>
                    <Button variant="ghost" className="text-emerald-600">
                      View all
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.comparisons.map((slug) => {
                    const [nameA, nameB] = slug.split('-vs-').map(s => s.replace(/-/g, ' '));
                    return (
                      <Link
                        key={slug}
                        href={`/compare/${slug}`}
                        className="group flex items-center justify-between rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-emerald-500 hover:shadow-lg"
                      >
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-3">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-slate-100 font-bold text-slate-600 text-sm">
                              {nameA.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-white bg-slate-200 font-bold text-slate-700 text-sm">
                              {nameB.charAt(0).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 capitalize group-hover:text-emerald-600">
                              {nameA} vs {nameB}
                            </p>
                            <p className="text-sm text-slate-500">{cat.category}</p>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-emerald-500" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* Building a Comparison */}
        <Card className="mt-16">
          <CardHeader>
            <CardTitle>Build Your Own Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-6">
              Compare any two companies across our directory to see how they stack up against each other.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">First Company</label>
                <input
                  type="text"
                  placeholder="Search companies..."
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Second Company</label>
                <input
                  type="text"
                  placeholder="Search companies..."
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
            <Button className="mt-4 bg-emerald-500 hover:bg-emerald-600">
              Compare Now
              <GitCompare className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
