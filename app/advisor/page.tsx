import { Brain } from 'lucide-react';
import AdvisorClient from './advisor-client';

export default function AdvisorPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
      {/* Header */}
      <div className="border-b border-slate-700">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 ring-1 ring-emerald-500/20">
              <Brain className="h-8 w-8 text-emerald-400" />
            </div>
            <h1 className="text-4xl font-bold text-white">AI Crypto Advisor</h1>
            <p className="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
              Answer a few questions and our AI will recommend the best crypto products for your specific needs.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <AdvisorClient />
      </div>
    </div>
  );
}
