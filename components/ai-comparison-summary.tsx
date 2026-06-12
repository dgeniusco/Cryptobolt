'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, TriangleAlert as AlertTriangle, Loader as Loader2, Sparkles } from 'lucide-react';

export default function AIComparisonSummary({ slug }: { slug: string }) {
  const [summary, setSummary] = useState<string | null>(null);
  const [bottomLine, setBottomLine] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchSummary() {
      try {
        const res = await fetch('/api/compare-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug }),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'Failed to generate summary');
        }

        const data = await res.json();
        setSummary(data.summary);
        setBottomLine(data.bottom_line);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong');
      } finally {
        setLoading(false);
      }
    }

    fetchSummary();
  }, [slug]);

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
        <CardContent className="py-8 flex items-center justify-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-400" />
          <span className="text-slate-400">Generating AI comparison summary...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return null; // Silently skip if AI fails — don't break the page
  }

  if (!summary) return null;

  return (
    <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-emerald-400" />
            AI Verdict
          </CardTitle>
          <Badge variant="outline" className="text-emerald-400 border-emerald-800 bg-emerald-900/20">
            AI-generated
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
          <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-400">
            AI-generated comparison. Not financial advice. Do your own research.
          </p>
        </div>
        <p className="text-slate-300 leading-relaxed">{summary}</p>
        {bottomLine && (
          <div className="rounded-lg bg-emerald-900/20 border border-emerald-800/50 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-emerald-400" />
              <span className="text-sm font-semibold text-emerald-400">Bottom Line</span>
            </div>
            <p className="text-slate-300">{bottomLine}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
