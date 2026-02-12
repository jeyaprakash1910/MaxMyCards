'use client';

import Link from 'next/link';

export function SiteNavbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0b1020]/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-semibold tracking-tight text-white">
          Credit Card Status
        </Link>
        <nav className="flex items-center gap-2">
          <Link
            href="/login"
            className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-200 hover:bg-white/5 hover:text-white"
          >
            Sign in
          </Link>
          <Link
            href="/app"
            className="rounded-xl bg-indigo-500 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            Open web app
          </Link>
        </nav>
      </div>
    </header>
  );
}

