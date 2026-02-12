import Link from 'next/link';
import { SiteNavbar } from '@/components/SiteNavbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0b1020] text-white">
      <SiteNavbar />

      <main className="mx-auto w-full max-w-6xl px-4 py-14">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
              <span className="h-2 w-2 rounded-full bg-indigo-400" />
              Web + App
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight sm:text-5xl">
              Track billing cycles and due dates. Never miss a payment.
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-8 text-slate-300">
              Credit Card Status helps you see exactly where each card is in its billing cycle and how many days
              remain until the due date.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/app"
                className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-400"
              >
                Open the web app
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-slate-100 hover:bg-white/10"
              >
                Sign in / Create account
              </Link>
            </div>

            <div className="mt-8 grid max-w-xl grid-cols-1 gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Cycle status</div>
                <div className="mt-1">See “days in” and “days left” in the billing cycle.</div>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="font-semibold text-white">Due timeline</div>
                <div className="mt-1">Past / Current / Next tabs with smart sorting.</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-indigo-500/20 via-white/5 to-emerald-400/10 p-6">
            <div className="rounded-2xl border border-white/10 bg-[#1a1a2e] p-5">
              <div className="text-sm font-semibold text-slate-200">Preview</div>
              <div className="mt-3 space-y-3">
                <div className="rounded-xl border border-white/10 bg-[#16213e] p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">HDFC Millennia</div>
                    <div className="text-xs font-semibold text-slate-300">Edit →</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    <span className="text-slate-400">Cycle:</span> 14 Jan - 13 Feb · 9 days left
                  </div>
                  <div className="mt-1 text-sm font-semibold text-emerald-300">
                    <span className="text-slate-400">Due:</span> 05 Mar 2026 · 28 days
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#16213e] p-4">
                  <div className="flex items-center justify-between">
                    <div className="font-semibold">Amazon Pay ICICI</div>
                    <div className="text-xs font-semibold text-slate-300">Edit →</div>
                  </div>
                  <div className="mt-2 text-sm text-slate-300">
                    <span className="text-slate-400">Cycle:</span> 01 Jan - 31 Jan · Ended
                  </div>
                  <div className="mt-1 text-sm font-semibold text-red-300">
                    <span className="text-slate-400">Due:</span> 15 Feb 2026 [Past Due]
                  </div>
                </div>
              </div>
              <div className="mt-4 text-xs text-slate-400">
                Tip: Add cards from catalog (optional) or use custom names.
              </div>
            </div>
          </div>
        </div>

        <footer className="mt-16 border-t border-white/10 pt-8 text-sm text-slate-400">
          Built with Next.js + Supabase. Your data stays in your Supabase project.
        </footer>
      </main>
    </div>
  );
}
