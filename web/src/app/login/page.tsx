'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

function normalizeAuthError(e: unknown): string {
  const msg = e instanceof Error ? e.message : 'Something went wrong';
  if (msg.includes('Email not confirmed')) {
    return 'Please check your email and click the confirmation link first.';
  }
  if (msg.includes('Invalid login credentials')) {
    return 'Wrong email or password. Did you create an account? Try "Create one" first.';
  }
  return msg;
}

export default function LoginPage() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setNotice(null);
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Please enter email and password');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: trimmedEmail,
          password,
        });
        if (signUpError) throw signUpError;
        setNotice('Account created! Please sign in.');
        setIsSignUp(false);
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password,
        });
        if (signInError) throw signInError;
        router.replace('/app');
        router.refresh();
      }
    } catch (e: unknown) {
      setError(normalizeAuthError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121a33] p-6 shadow-xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Credit Card Status</h1>
            <p className="mt-1 text-sm text-slate-300">
              Track your cards, never miss a due date
            </p>
          </div>

          <label className="block text-sm font-medium text-slate-200">Email</label>
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoCapitalize="none"
            autoCorrect="off"
            inputMode="email"
          />

          <label className="mt-4 block text-sm font-medium text-slate-200">Password</label>
          <input
            className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Password (min 6 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
          />

          {notice ? (
            <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
              {notice}
            </div>
          ) : null}

          {error ? (
            <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            disabled={loading}
            onClick={submit}
            className="mt-5 w-full rounded-xl bg-indigo-500 px-4 py-3 text-center text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
          >
            {loading ? 'Please wait…' : isSignUp ? 'Create account' : 'Sign in'}
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={() => {
              setError(null);
              setNotice(null);
              setIsSignUp((v) => !v);
            }}
            className="mt-4 w-full rounded-xl px-4 py-3 text-center text-sm font-semibold text-indigo-300 hover:bg-white/5 disabled:opacity-60"
          >
            {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Create one"}
          </button>

          <div className="mt-6 flex items-center justify-between text-sm text-slate-400">
            <Link href="/" className="hover:text-white">
              ← Back to home
            </Link>
            <Link href="/app" className="hover:text-white">
              Go to app →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

