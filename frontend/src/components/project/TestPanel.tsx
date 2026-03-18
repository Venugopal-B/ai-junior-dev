import { TestGenerationResult } from '@/types';

export function TestPanel({ result }: { result: TestGenerationResult }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-xs px-2 py-0.5 rounded bg-green-900/20 text-green-400 border border-green-800/30 font-medium">
          {result.framework}
        </span>
        <span className="text-xs text-[#555d70]">{result.scenarios?.length ?? 0} scenarios</span>
      </div>
      <p className="text-sm text-[#8a90a0] bg-[#181c24] rounded-md p-3 leading-relaxed">{result.summary}</p>
      {result.scenarios?.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#555d70] mb-2">Scenarios</h4>
          <div className="bg-[#181c24] rounded-md divide-y divide-[rgba(255,255,255,0.04)]">
            {result.scenarios.map((s, i) => (
              <div key={i} className="flex gap-2 px-3 py-2">
                <span className="text-green-400 text-xs mt-0.5 flex-shrink-0">✓</span>
                <div>
                  <p className="text-xs font-medium text-[#e8eaf0]">{s.name}</p>
                  <p className="text-xs text-[#555d70]">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
      {result.generatedTestCode && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#555d70] mb-2">Generated Code</h4>
          <pre className="text-xs font-mono text-[#8a90a0] bg-[#181c24] rounded-md p-3 overflow-auto max-h-48 leading-relaxed whitespace-pre-wrap">
            {result.generatedTestCode}
          </pre>
        </section>
      )}
    </div>
  );
}
