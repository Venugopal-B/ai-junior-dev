import { useRef } from 'react';

interface CodeViewerProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function CodeViewer({ value, onChange, readOnly = false }: CodeViewerProps) {
  const gutterRef = useRef<HTMLDivElement>(null);
  const lineCount = Math.max(1, value.split('\n').length);
  const lines = Array.from({ length: lineCount }, (_, index) => index + 1);

  return (
    <div className="flex-1 overflow-hidden bg-[#0d1016]">
      <div className="flex h-full font-mono text-xs leading-7">
        <div
          ref={gutterRef}
          className="w-14 overflow-hidden border-r border-[rgba(255,255,255,0.07)] bg-[#111318] px-2 py-5 text-right text-[#555d70] select-none"
        >
          {lines.map((line) => (
            <div key={line}>{line}</div>
          ))}
        </div>
        <textarea
          value={value}
          readOnly={readOnly}
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
          onScroll={(event) => {
            if (gutterRef.current) {
              gutterRef.current.scrollTop = event.currentTarget.scrollTop;
            }
          }}
          className="flex-1 resize-none overflow-auto bg-transparent px-4 py-5 text-[#d8deea] outline-none [tab-size:2]"
        />
      </div>
    </div>
  );
}
