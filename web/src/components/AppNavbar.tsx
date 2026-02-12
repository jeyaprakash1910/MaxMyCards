'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function AppNavbar() {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [signingOut, setSigningOut] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#1a1a2e]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/app" className="font-semibold tracking-tight text-white">
            Credit Card Status
          </Link>
          <nav className="hidden items-center gap-3 text-sm text-slate-300 sm:flex">
            <Link href="/app" className="hover:text-white">
              Dashboard
            </Link>
            <Link href="/app/add" className="hover:text-white">
              Add card
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/app/add"
            className="hidden rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400 sm:inline"
          >
            + Add
          </Link>
          <button
            type="button"
            disabled={signingOut}
            className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white disabled:opacity-60"
            onClick={async () => {
              setSigningOut(true);
              try {
                await supabase.auth.signOut();
              } finally {
                setSigningOut(false);
                router.replace('/login');
                router.refresh();
              }
            }}
          >
            {signingOut ? 'Logging out…' : 'Logout'}
          </button>
        </div>
      </div>
    </header>
  );
}

