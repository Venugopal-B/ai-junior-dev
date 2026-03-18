interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'green' | 'amber' | 'red' | 'gray' | 'purple';
  className?: string;
}

const variants = {
  blue: 'bg-blue-900/20 text-blue-400 border border-blue-800/30',
  green: 'bg-green-900/20 text-green-400 border border-green-800/30',
  amber: 'bg-amber-900/20 text-amber-400 border border-amber-800/30',
  red: 'bg-red-900/20 text-red-400 border border-red-800/30',
  gray: 'bg-white/5 text-gray-400 border border-white/10',
  purple: 'bg-purple-900/20 text-purple-400 border border-purple-800/30',
};

export function Badge({ children, variant = 'gray', className = '' }: BadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

import React from 'react';
