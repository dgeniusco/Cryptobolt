import { supabase } from '@/lib/supabase';
import SubmitClient from './submit-client';
import { Send } from 'lucide-react';

export default async function SubmitPage() {
  const { data: categories } = await supabase
    .from('categories')
    .select('slug, name')
    .eq('is_active', true)
    .order('order_index');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Send className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">Submit a Company</h1>
            <p className="mt-4 text-lg text-slate-400">
              Add your crypto company to the Cryptoffiliate directory
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <SubmitClient categories={categories || []} />
      </div>
    </div>
  );
}
