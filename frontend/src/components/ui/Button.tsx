import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'outline' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  primary: 'bg-[#4f8ef7] text-white hover:bg-[#3a7ef0] border-transparent',
  ghost: 'bg-transparent text-[#8a90a0] border-[rgba(255,255,255,0.12)] hover:border-[#4f8ef7] hover:text-[#4f8ef7]',
  outline: 'bg-transparent text-[#4f8ef7] border-[#4f8ef7] hover:bg-[#4f8ef7] hover:text-white',
  danger: 'bg-[#f74f4f] text-white border-transparent hover:bg-[#e03c3c]',
  success: 'bg-[#34d97b] text-[#0a0b0e] border-transparent hover:bg-[#2bc66e]',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
};

export function Button({ variant = 'primary', size = 'md', loading, disabled, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 rounded-md border font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}
