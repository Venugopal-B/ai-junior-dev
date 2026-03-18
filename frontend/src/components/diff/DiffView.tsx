interface DiffViewProps {
  originalCode: string;
  suggestedCode: string;
  title?: string;
}

export function DiffView({ originalCode, suggestedCode, title }: DiffViewProps) {
  const oldLines = originalCode.split('\n').slice(0, 8);
  const newLines = suggestedCode.split('\n').slice(0, 8);

  return (
    <div className="rounded-md border border-[rgba(255,255,255,0.07)] overflow-hidden font-mono text-xs">
      {title && (
        <div className="px-3 py-1.5 bg-[#181c24] border-b border-[rgba(255,255,255,0.07)] text-[#555d70]">
          {title}
        </div>
      )}
      <div className="divide-y divide-[rgba(255,255,255,0.04)]">
        {oldLines.map((line, i) => (
          <div key={`o${i}`} className="flex gap-2 px-3 py-0.5 bg-red-950/20">
            <span className="text-red-600 w-3 flex-shrink-0">-</span>
            <span className="text-red-300/80">{line}</span>
          </div>
        ))}
        {newLines.map((line, i) => (
          <div key={`n${i}`} className="flex gap-2 px-3 py-0.5 bg-green-950/20">
            <span className="text-green-600 w-3 flex-shrink-0">+</span>
            <span className="text-green-300/80">{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
