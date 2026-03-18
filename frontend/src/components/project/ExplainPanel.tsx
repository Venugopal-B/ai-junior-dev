import { CodeExplanationResult } from '@/types';

export function ExplainPanel({ result }: { result: CodeExplanationResult }) {
  return (
    <div className="space-y-5">
      <section>
        <h4 className="text-xs font-semibold uppercase tracking-wider text-[#555d70] mb-2">Summary</h4>
        <p className="text-sm text-[#8a90a0] leading-relaxed bg-[#181c24] rounded-md p-3">{result.summary}</p>
      </section>

      {result.keyFunctions?.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#555d70] mb-2">Key Functions</h4>
          <div className="space-y-2">
            {result.keyFunctions.map((fn, i) => (
              <div key={i}>
                <code className="text-cyan-400 text-xs">{fn.name}()</code>
                <p className="text-xs text-[#8a90a0] mt-0.5">{fn.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {result.responsibilities?.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#555d70] mb-2">Responsibilities</h4>
          <ul className="space-y-1">
            {result.responsibilities.map((r, i) => (
              <li key={i} className="flex gap-2 text-xs text-[#8a90a0]">
                <span className="text-[#4f8ef7] flex-shrink-0">→</span>{r}
              </li>
            ))}
          </ul>
        </section>
      )}

      {result.riskyAreas?.length > 0 && (
        <section>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#555d70] mb-2">⚠ Risk Areas</h4>
          <div className="space-y-2">
            {result.riskyAreas.map((r, i) => (
              <div key={i} className="bg-amber-950/20 border border-amber-800/20 rounded-md p-2.5">
                <p className="text-xs font-medium text-amber-400">{r.area}</p>
                <p className="text-xs text-[#8a90a0] mt-0.5">{r.risk}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
