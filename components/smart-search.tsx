'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, Loader as Loader2, Sparkles, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SmartSearch() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setExplanation('');

    try {
      const res = await fetch('/api/smart-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });

      if (!res.ok) {
        throw new Error('Failed to process query');
      }

      const data = await res.json();

      // Build new URL with AI-suggested filters
      const params = new URLSearchParams(searchParams.toString());

      if (data.category_slug) {
        // Navigate to the category page with filters
        params.set('ai', 'true');
        const tagParams = data.tags?.length ? `&tags=${data.tags.join(',')}` : '';
        router.push(`/category/${data.category_slug}?${params.toString()}${tagParams}`);
      }

      if (data.explanation) {
        setExplanation(data.explanation);
      }
    } catch {
      setError('Unable to process your query. Try browsing categories manually.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Brain className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe what you're looking for — e.g. 'a beginner-friendly exchange with low fees in the US'"
              className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-11 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-sm"
              disabled={loading}
            />
          </div>
          <Button
            type="submit"
            disabled={loading || !query.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 shrink-0"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>

      {explanation && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
          <Sparkles className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
          <p className="text-sm text-emerald-700 flex-1">{explanation}</p>
          <button onClick={() => setExplanation('')} className="text-emerald-400 hover:text-emerald-600">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}
