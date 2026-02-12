'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { CreditCard } from '@/lib/types';
import { computeCard, getDefaultSortForMonth, sortCards, type MonthFilter, type SortBy, type SortDir } from '@/lib/dashboardLogic';
import { FilterSortBar } from '@/components/FilterSortBar';
import { CardListItem } from '@/components/CardListItem';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

export function DashboardClient({ initialCards }: { initialCards: CreditCard[] }) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawCards, setRawCards] = useState<CreditCard[]>(initialCards);

  const [month, setMonth] = useState<MonthFilter>('current');
  const defaultSort = getDefaultSortForMonth('current');
  const [sortBy, setSortBy] = useState<SortBy>(defaultSort.sortBy);
  const [sortDir, setSortDir] = useState<SortDir>(defaultSort.sortDir);

  const handleMonthChange = useCallback((m: MonthFilter) => {
    setMonth(m);
    const { sortBy: sb, sortDir: sd } = getDefaultSortForMonth(m);
    setSortBy(sb);
    setSortDir(sd);
  }, []);

  const fetchCards = useCallback(async () => {
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setRawCards([]);
      return;
    }

    const { data, error: fetchError } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error(fetchError);
      setError(fetchError.message);
      setRawCards([]);
      return;
    }

    setRawCards((data ?? []) as CreditCard[]);
  }, [supabase]);

  useEffect(() => {
    // hydrate from server-provided data, then ensure client session works
    setLoading(false);
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCards();
    setRefreshing(false);
  }, [fetchCards]);

  const computed = useMemo(() => rawCards.map(computeCard), [rawCards]);
  const sortedCards = useMemo(() => sortCards(computed, month, sortBy, sortDir), [computed, month, sortBy, sortDir]);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">My Credit Cards</h1>
          <p className="mt-1 text-sm text-slate-300">Billing cycles, due dates, and days remaining.</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <Link
            href="/app/add"
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            + Add
          </Link>
        </div>
      </div>

      <FilterSortBar
        month={month}
        onMonthChange={handleMonthChange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDir={sortDir}
        onSortDirChange={setSortDir}
      />

      {loading ? (
        <div className="rounded-2xl border border-white/10 bg-[#16213e] p-8 text-slate-300">Loading…</div>
      ) : error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
          Failed to load cards: {error}
        </div>
      ) : sortedCards.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#16213e] p-8">
          <div className="text-lg font-semibold text-white">No cards yet</div>
          <div className="mt-1 text-sm text-slate-300">Add your first credit card to get started.</div>
          <Link
            href="/app/add"
            className="mt-5 inline-flex rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400"
          >
            + Add card
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCards.map((card) => (
            <CardListItem key={card.id} card={card} month={month} />
          ))}
        </div>
      )}
    </div>
  );
}

