import { RunType } from '@/types';

export function formatDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString();
}

export function runTypeLabel(type: RunType): string {
  const map: Record<RunType, string> = {
    explain: 'Code Explanation',
    analyze: 'Bug Analysis',
    'generate-tests': 'Test Generation',
    'suggest-fix': 'Fix Suggestions',
  };
  return map[type] ?? type;
}

export function runTypeEmoji(type: RunType): string {
  const map: Record<RunType, string> = {
    explain: '📖',
    analyze: '🐛',
    'generate-tests': '🧪',
    'suggest-fix': '🔧',
  };
  return map[type] ?? '●';
}

export function severityColor(sev: string): string {
  if (sev === 'high') return 'text-red-400 bg-red-900/20 border-red-800/30';
  if (sev === 'medium') return 'text-amber-400 bg-amber-900/20 border-amber-800/30';
  return 'text-blue-400 bg-blue-900/20 border-blue-800/30';
}

export function langColor(lang: string): string {
  const map: Record<string, string> = {
    TypeScript: 'text-blue-400 bg-blue-900/20',
    JavaScript: 'text-amber-400 bg-amber-900/20',
    Python: 'text-green-400 bg-green-900/20',
    Go: 'text-cyan-400 bg-cyan-900/20',
    Rust: 'text-orange-400 bg-orange-900/20',
  };
  return map[lang] ?? 'text-gray-400 bg-gray-800/40';
}
