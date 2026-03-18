export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-5 h-5';
  return (
    <span className={`${s} border-2 border-[rgba(255,255,255,0.12)] border-t-[#4f8ef7] rounded-full animate-spin inline-block`} />
  );
}
