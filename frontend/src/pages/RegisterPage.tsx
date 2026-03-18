import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const nav = useNavigate();
  const { register, isLoading, error, clearError } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name || form.name.length < 2) errs.name = 'Name must be at least 2 characters';
    if (!form.email.includes('@')) errs.email = 'Invalid email';
    if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(form.password)) errs.password = 'Must contain an uppercase letter';
    if (!/[0-9]/.test(form.password)) errs.password = 'Must contain a number';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    if (!validate()) return;
    try {
      await register(form.name, form.email, form.password);
      nav('/dashboard');
    } catch { /* shown via store */ }
  };

  return (
    <div className="min-h-screen bg-[#0a0b0e] flex items-center justify-center p-4">
      <div className="bg-[#111318] border border-[rgba(255,255,255,0.12)] rounded-xl p-10 w-full max-w-md">
        <button onClick={() => nav('/')} className="flex items-center gap-2 mb-8 font-display font-bold text-[#e8eaf0]">
          <span className="w-2 h-2 rounded-full bg-[#4f8ef7]" /> DevAssist AI
        </button>
        <h2 className="font-display text-2xl font-bold mb-1">Create account</h2>
        <p className="text-sm text-[#8a90a0] mb-8">Start analyzing your code for free</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Alex Chen" error={fieldErrors.name} />
          <Input label="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" error={fieldErrors.email} />
          <Input label="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min. 8 chars, 1 uppercase, 1 number" error={fieldErrors.password} />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <Button type="submit" className="w-full justify-center" loading={isLoading}>Create Account</Button>
        </form>

        <p className="text-center text-sm text-[#8a90a0] mt-6">
          Already have an account?{' '}
          <button onClick={() => nav('/login')} className="text-[#4f8ef7] hover:underline">Sign in</button>
        </p>
      </div>
    </div>
  );
}
