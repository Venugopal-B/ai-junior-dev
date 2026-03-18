import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, subtitle, children }: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <h3 className="font-display text-lg font-semibold text-[#e8eaf0] mb-1">{title}</h3>
        {subtitle && <p className="text-sm text-[#8a90a0] mb-6">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
