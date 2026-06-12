'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Brain, ArrowRight, ExternalLink, Star, Sparkles, TriangleAlert as AlertTriangle, Loader as Loader2 } from 'lucide-react';
import Link from 'next/link';

type Recommendation = {
  company_slug: string;
  reason: string;
  tradeoff: string;
};

type AdvisorResult = {
  recommendations: Recommendation[];
  summary: string;
};

export default function AdvisorClient() {
  const [experience, setExperience] = useState('');
  const [goal, setGoal] = useState('');
  const [budget, setBudget] = useState('');
  const [country, setCountry] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AdvisorResult | null>(null);
  const [rawText, setRawText] = useState('');
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!experience || !goal) return;

    setLoading(true);
    setResult(null);
    setRawText('');
    setError('');

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ experience, goal, budget, country }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to get recommendations');
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response stream');

      let accumulated = '';
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;
        setRawText(accumulated);
      }

      // Try to parse the accumulated text as JSON
      try {
        // Extract JSON from the text (might have surrounding text)
        const jsonMatch = accumulated.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setResult(parsed);
        }
      } catch {
        // If JSON parsing fails, we still have the raw text to display
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* Form */}
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-400" />
            Tell Us About Your Needs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Experience Level *
                </label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select your level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Primary Goal *
                </label>
                <Select value={goal} onValueChange={setGoal}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="What are you looking for?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="trading">Buying & Trading Crypto</SelectItem>
                    <SelectItem value="storing">Storing Crypto Securely</SelectItem>
                    <SelectItem value="tax-filing">Tax Filing & Reporting</SelectItem>
                    <SelectItem value="automated-trading">Automated Trading</SelectItem>
                    <SelectItem value="mining">Mining</SelectItem>
                    <SelectItem value="staking">Earning Passive Income</SelectItem>
                    <SelectItem value="defi">DeFi & Yield</SelectItem>
                    <SelectItem value="nft">NFTs</SelectItem>
                    <SelectItem value="education">Learning & Education</SelectItem>
                    <SelectItem value="analytics">Analytics & Research</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Budget Preference
                </label>
                <Select value={budget} onValueChange={setBudget}>
                  <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free tools only</SelectItem>
                    <SelectItem value="low">Under $50</SelectItem>
                    <SelectItem value="medium">$50 - $200</SelectItem>
                    <SelectItem value="high">$200+</SelectItem>
                    <SelectItem value="any">No budget limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. United States, UK, Germany"
                  className="w-full rounded-md border border-slate-600 bg-slate-900/50 px-3 py-2 text-white placeholder:text-slate-500 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || !experience || !goal}
              className="bg-emerald-500 hover:bg-emerald-600 text-white"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {(loading || rawText || result || error) && (
        <div className="space-y-6">
          {/* AI Disclaimer */}
          <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
            <p className="text-xs text-yellow-400">
              AI-generated recommendations. Not financial advice. Always do your own research before choosing any crypto product.
            </p>
          </div>

          {/* Streaming text */}
          {loading && rawText && !result && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
              <CardContent className="pt-6">
                <p className="text-slate-300 whitespace-pre-wrap">{rawText}</p>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Card className="bg-red-900/20 border-red-800">
              <CardContent className="pt-6">
                <p className="text-red-400">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Parsed Results */}
          {result && (
            <>
              {result.summary && (
                <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <p className="text-slate-300">{result.summary}</p>
                  </CardContent>
                </Card>
              )}

              {result.recommendations?.map((rec) => (
                <Card key={rec.company_slug} className="bg-slate-800/50 border-emerald-900/50 backdrop-blur-sm hover:border-emerald-700 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Link
                            href={`/company/${rec.company_slug}`}
                            className="text-lg font-semibold text-white hover:text-emerald-400"
                          >
                            {rec.company_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </Link>
                          <Badge className="bg-emerald-900/30 text-emerald-400 border-emerald-800">
                            AI Pick
                          </Badge>
                        </div>
                        <p className="text-slate-300 mb-3">{rec.reason}</p>
                        {rec.tradeoff && (
                          <p className="text-sm text-slate-500">
                            <span className="text-yellow-500">Tradeoff:</span> {rec.tradeoff}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link href={`/company/${rec.company_slug}`}>
                          <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                            Details
                          </Button>
                        </Link>
                        <Link href={`/go/${rec.company_slug}`} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="bg-emerald-500 hover:bg-emerald-600">
                            Visit <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
