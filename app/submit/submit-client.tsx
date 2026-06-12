'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sparkles, Loader as Loader2, Send, TriangleAlert as AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function SubmitClient({ categories }: { categories: { slug: string; name: string }[] }) {
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [generating, setGenerating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleGenerateDescription() {
    if (!companyName) return;

    setGenerating(true);
    try {
      const res = await fetch('/api/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyName, website, category }),
      });

      if (!res.ok) {
        throw new Error('Failed to generate description');
      }

      const data = await res.json();
      if (data.description) {
        setDescription(data.description);
        toast({ title: 'Description generated', description: 'Review and edit before submitting.' });
      }
    } catch {
      toast({ title: 'Error', description: 'Could not generate description. Please write one manually.', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    // Simulate submission for now
    await new Promise(resolve => setTimeout(resolve, 1000));

    toast({
      title: 'Submission received',
      description: 'Your company will be reviewed within 48 hours.',
    });

    setSubmitting(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3">
        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
        <p className="text-xs text-yellow-400">
          AI-generated descriptions should be reviewed for accuracy before submission. All submissions are subject to review.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white">Company Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-slate-300">Company Name *</Label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Binance"
                  className="bg-slate-900/50 border-slate-600 text-white mt-1"
                  required
                />
              </div>
              <div>
                <Label className="text-slate-300">Website URL *</Label>
                <Input
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.example.com"
                  className="bg-slate-900/50 border-slate-600 text-white mt-1"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-slate-300">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600 text-white mt-1">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.slug} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-slate-300">Description *</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerateDescription}
                  disabled={generating || !companyName}
                  className="text-emerald-400 hover:text-emerald-300"
                >
                  {generating ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  Generate with AI
                </Button>
              </div>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the company, its products, and what makes it unique..."
                className="bg-slate-900/50 border-slate-600 text-white min-h-[120px]"
                required
              />
            </div>
          </CardContent>
        </Card>

        <Button
          type="submit"
          disabled={submitting || !companyName || !website || !description}
          className="bg-emerald-500 hover:bg-emerald-600 w-full"
          size="lg"
        >
          {submitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Send className="mr-2 h-4 w-4" />
          )}
          Submit for Review
        </Button>
      </form>
    </div>
  );
}
