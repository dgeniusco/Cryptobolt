import { supabase, type AffiliateClickAggregation } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MousePointerClick, TrendingUp, ExternalLink, ChartBar as BarChart3, ArrowRight } from 'lucide-react';
import Link from 'next/link';

async function getAffiliateClicks(days: number): Promise<AffiliateClickAggregation[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);
  const sinceStr = since.toISOString();

  const { data, error } = await supabase
    .from('affiliate_clicks')
    .select('company_slug')
    .gte('clicked_at', sinceStr);

  if (error || !data || data.length === 0) return [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString();

  const { data: todayData } = await supabase
    .from('affiliate_clicks')
    .select('company_slug')
    .gte('clicked_at', todayStr);

  const todayCountMap: Record<string, number> = {};
  if (todayData) {
    for (const row of todayData) {
      todayCountMap[row.company_slug] = (todayCountMap[row.company_slug] || 0) + 1;
    }
    }

  const countMap: Record<string, number> = {};
  for (const row of data) {
    countMap[row.company_slug] = (countMap[row.company_slug] || 0) + 1;
  }

  // Get company names
  const slugs = Object.keys(countMap);
  const { data: companies } = await supabase
    .from('companies')
    .select('slug, name')
    .in('slug', slugs);

  const nameMap: Record<string, string> = {};
  if (companies) {
    for (const c of companies) {
      nameMap[c.slug] = c.name;
    }
  }

  return slugs
    .map((slug) => ({
      company_slug: slug,
      company_name: nameMap[slug] || slug,
      total_clicks: countMap[slug],
      clicks_today: todayCountMap[slug] || 0,
    }))
    .sort((a, b) => b.total_clicks - a.total_clicks);
}

async function getTotalClicks() {
  const since7 = new Date();
  since7.setDate(since7.getDate() - 7);
  const since30 = new Date();
  since30.setDate(since30.getDate() - 30);
  const since90 = new Date();
  since90.setDate(since90.getDate() - 90);

  const [last7, last30, last90] = await Promise.all([
    supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }).gte('clicked_at', since7.toISOString()),
    supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }).gte('clicked_at', since30.toISOString()),
    supabase.from('affiliate_clicks').select('id', { count: 'exact', head: true }).gte('clicked_at', since90.toISOString()),
  ]);

  return {
    last7days: last7.count || 0,
    last30days: last30.count || 0,
    last90days: last90.count || 0,
  };
}

export default async function DashboardPage() {
  const [clicks7, clicks30, clicks90, totals] = await Promise.all([
    getAffiliateClicks(7),
    getAffiliateClicks(30),
    getAffiliateClicks(90),
    getTotalClicks(),
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-emerald-400" />
            <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          </div>
          <p className="mt-2 text-slate-400">Track affiliate performance and platform analytics</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid gap-4 sm:grid-cols-3 mb-8">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">Last 7 Days</p>
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="mt-2 text-3xl font-bold text-white">{totals.last7days}</p>
              <p className="text-xs text-slate-500">affiliate clicks</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">Last 30 Days</p>
                <MousePointerClick className="h-5 w-5 text-blue-400" />
              </div>
              <p className="mt-2 text-3xl font-bold text-white">{totals.last30days}</p>
              <p className="text-xs text-slate-500">affiliate clicks</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-400">Last 90 Days</p>
                <ExternalLink className="h-5 w-5 text-teal-400" />
              </div>
              <p className="mt-2 text-3xl font-bold text-white">{totals.last90days}</p>
              <p className="text-xs text-slate-500">affiliate clicks</p>
            </CardContent>
          </Card>
        </div>

        {/* Affiliate Clicks Table */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Affiliate Clicks by Company</CardTitle>
              <Badge variant="outline" className="text-emerald-400 border-emerald-800 bg-emerald-900/20">
                Last 30 days
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {clicks30.length === 0 ? (
              <div className="py-12 text-center">
                <MousePointerClick className="mx-auto h-12 w-12 text-slate-600" />
                <p className="mt-4 text-slate-400">No affiliate clicks recorded yet.</p>
                <p className="text-sm text-slate-500">Clicks will appear here once users start using affiliate links.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Company</TableHead>
                    <TableHead className="text-slate-400 text-right">Total Clicks</TableHead>
                    <TableHead className="text-slate-400 text-right">Clicks Today</TableHead>
                    <TableHead className="text-slate-400 text-right">Avg/Day</TableHead>
                    <TableHead className="text-slate-400"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clicks30.map((row) => (
                    <TableRow key={row.company_slug} className="border-slate-700 hover:bg-slate-700/50">
                      <TableCell className="font-medium text-white">
                        {row.company_name}
                      </TableCell>
                      <TableCell className="text-right text-emerald-400 font-semibold">
                        {row.total_clicks}
                      </TableCell>
                      <TableCell className="text-right">
                        {row.clicks_today > 0 ? (
                          <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-800">
                            {row.clicks_today}
                          </Badge>
                        ) : (
                          <span className="text-slate-500">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right text-slate-300">
                        {(row.total_clicks / 30).toFixed(1)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/company/${row.company_slug}`}
                          className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300"
                        >
                          View
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* 7-Day and 90-Day Tables */}
        <div className="grid gap-6 mt-6 lg:grid-cols-2">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">Recent (7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {clicks7.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No clicks in the past 7 days</p>
              ) : (
                <div className="space-y-3">
                  {clicks7.slice(0, 10).map((row) => (
                    <div key={row.company_slug} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                      <span className="text-sm text-slate-300">{row.company_name}</span>
                      <span className="text-sm font-medium text-emerald-400">{row.total_clicks} clicks</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">All-Time (90 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              {clicks90.length === 0 ? (
                <p className="text-slate-500 text-sm py-4 text-center">No clicks in the past 90 days</p>
              ) : (
                <div className="space-y-3">
                  {clicks90.slice(0, 10).map((row) => (
                    <div key={row.company_slug} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                      <span className="text-sm text-slate-300">{row.company_name}</span>
                      <span className="text-sm font-medium text-emerald-400">{row.total_clicks} clicks</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
