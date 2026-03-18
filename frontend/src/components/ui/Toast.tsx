import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'text-green-400',
    error: 'text-red-400',
    info: 'text-blue-400',
  };
  const icons = { success: '✓', error: '✕', info: '●' };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-lg px-4 py-3 text-sm text-[#e8eaf0] animate-slide-in shadow-xl">
      <span className={colors[type]}>{icons[type]}</span>
      {message}
    </div>
  );
}
