import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const nav = useNavigate();
  const { login, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ email: 'demo@devassist.ai', password: 'Demo1234' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      await login(form.email, form.password);
      nav('/dashboard');
    } catch { /* error shown via store */ }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] flex items-center justify-center p-4">
      <div className="bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl p-10 w-full max-w-md">
        <button onClick={() => nav('/')} className="flex items-center gap-2 mb-8 font-display font-bold text-[#e8eaf0]">
          <span className="w-2 h-2 rounded-full bg-[#4f8ef7]" /> DevAssist AI
        </button>
        <h2 className="font-display text-2xl font-bold mb-1">Welcome back</h2>
        <p className="text-sm text-[#8a90a0] mb-8">Sign in to your workspace</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="••••••••" />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full justify-center" loading={isLoading}>Sign In</Button>
        </form>

        <p className="text-center text-sm text-[#8a90a0] mt-6">
          Don't have an account?{' '}
          <button onClick={() => nav('/register')} className="text-[#4f8ef7] hover:underline">Sign up</button>
        </p>
      </div>
    </div>
  );
}
