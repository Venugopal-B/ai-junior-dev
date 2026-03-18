import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-1">
      {label && <label className="text-xs font-medium text-[#8a90a0]">{label}</label>}
      <input
        className={`w-full bg-[#181c24] border rounded-md px-3 py-2.5 text-sm text-[#e8eaf0] placeholder-[#555d70] outline-none transition-colors ${error ? 'border-red-500' : 'border-[rgba(255,255,255,0.12)] focus:border-[#4f8ef7]'} ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
