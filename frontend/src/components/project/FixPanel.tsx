import { useState } from 'react';
import { FixSuggestionResult } from '@/types';
import { DiffView } from '@/components/diff/DiffView';
import { Button } from '@/components/ui/Button';

export function FixPanel({ result }: { result: FixSuggestionResult }) {
  const [accepted, setAccepted] = useState<Record<number, 'accepted' | 'rejected'>>({});

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#8a90a0] bg-[#181c24] rounded-md p-3 leading-relaxed">{result.summary}</p>
      {result.fixes?.map((fix, i) => (
        <div key={i} className="border border-[rgba(255,255,255,0.07)] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2.5 bg-[#181c24]">
            <span className="text-sm font-medium text-[#e8eaf0]">{fix.title}</span>
            <div className="flex gap-2">
              {!accepted[i] ? (
                <>
                  <Button size="sm" variant="success" onClick={() => setAccepted({ ...accepted, [i]: 'accepted' })}>✓ Accept</Button>
                  <Button size="sm" variant="ghost" onClick={() => setAccepted({ ...accepted, [i]: 'rejected' })}>✕</Button>
                </>
              ) : (
                <span className={`text-xs ${accepted[i] === 'accepted' ? 'text-green-400' : 'text-[#555d70]'}`}>
                  {accepted[i] === 'accepted' ? 'Accepted ✓' : 'Rejected'}
                </span>
              )}
            </div>
          </div>
          <div className="p-3 space-y-2">
            <p className="text-xs text-[#8a90a0]">{fix.explanation}</p>
            <DiffView originalCode={fix.originalCode} suggestedCode={fix.suggestedCode} />
            {fix.diffSummary && <p className="text-xs text-[#555d70]">{fix.diffSummary}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
