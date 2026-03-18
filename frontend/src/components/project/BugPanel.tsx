import { BugAnalysisResult } from '@/types';
import { severityColor } from '@/lib/utils';

export function BugPanel({ result }: { result: BugAnalysisResult }) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-[#8a90a0] bg-[#181c24] rounded-md p-3 leading-relaxed">{result.summary}</p>
      {result.issues?.map((issue, i) => (
        <div key={i} className={`rounded-md p-3 border space-y-1.5 ${
          issue.severity === 'high' ? 'bg-red-950/20 border-red-800/30' :
          issue.severity === 'medium' ? 'bg-amber-950/20 border-amber-800/30' :
          'bg-blue-950/20 border-blue-800/30'
        }`}>
          <div className="flex items-center gap-2">
            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${severityColor(issue.severity)}`}>
              {issue.severity}
            </span>
            <span className="text-sm font-medium text-[#e8eaf0]">{issue.title}</span>
          </div>
          <p className="text-xs text-[#8a90a0] leading-relaxed">{issue.explanation}</p>
          {issue.affectedArea && (
            <p className="text-xs font-mono text-[#555d70]">📍 {issue.affectedArea}</p>
          )}
          {issue.suggestedAction && (
            <p className="text-xs text-[#4f8ef7]">→ {issue.suggestedAction}</p>
          )}
        </div>
      ))}
    </div>
  );
}
