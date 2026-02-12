'use client';

import { useEffect, useMemo, useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import type { CatalogCard } from '@/lib/catalog';
import { searchCatalog } from '@/lib/catalog';
import {
  dueDateDaysToDayOfMonth,
  dueDayOfMonthToDays,
  getCurrentCycle,
  ordinalDay,
} from '@/lib/cycleUtils';
import { DayGrid } from './DayGrid';

const DUE_DAYS_OPTIONS = [14, 15, 18, 20, 21, 24, 25, 28, 30];

export type CardFormValue = {
  name: string;
  imageUrl: string | null;
  catalogId: string | null;
  cycleStartDay: number;
  cycleEndDay: number;
  dueDateDays: number;
};

export function CardForm({
  title,
  initialValue,
  submitLabel,
  onSubmit,
  onDelete,
  submitting,
}: {
  title: string;
  initialValue: CardFormValue;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (v: CardFormValue) => Promise<void>;
  onDelete?: () => Promise<void>;
}) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [catalog, setCatalog] = useState<CatalogCard[]>([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [search, setSearch] = useState('');

  const [name, setName] = useState(initialValue.name);
  const [imageUrl, setImageUrl] = useState<string | null>(initialValue.imageUrl);
  const [catalogId, setCatalogId] = useState<string | null>(initialValue.catalogId);
  const [cycleStartDay, setCycleStartDay] = useState(initialValue.cycleStartDay);
  const [cycleEndDay, setCycleEndDay] = useState(initialValue.cycleEndDay);
  const [dueDateDays, setDueDateDays] = useState(initialValue.dueDateDays);
  const [dueDateMode, setDueDateMode] = useState<'days' | 'date'>('days');

  const filteredCatalog = useMemo(() => searchCatalog(catalog, search), [catalog, search]);

  const { cycleEnd } = useMemo(() => getCurrentCycle(cycleStartDay, cycleEndDay), [cycleStartDay, cycleEndDay]);
  const dueDayOfMonth = useMemo(() => dueDateDaysToDayOfMonth(cycleEnd, dueDateDays), [cycleEnd, dueDateDays]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from('card_catalog')
        .select('id, name, image_url, bank')
        .order('name');
      if (!error) setCatalog((data ?? []) as CatalogCard[]);
      setLoadingCatalog(false);
    })();
  }, [supabase]);

  const selectFromCatalog = (card: CatalogCard) => {
    setSearch('');
    setName(card.name);
    setImageUrl(card.image_url);
    setCatalogId(card.id);
  };

  const useCustom = () => {
    setName('');
    setImageUrl(null);
    setCatalogId(null);
  };

  const submit = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      alert('Please enter a card name');
      return;
    }
    await onSubmit({
      name: trimmed,
      imageUrl,
      catalogId,
      cycleStartDay,
      cycleEndDay,
      dueDateDays,
    });
  };

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          <p className="mt-1 text-sm text-slate-300">Pick from catalog or enter a custom card name.</p>
        </div>
        <div className="flex items-center gap-2">
          {onDelete ? (
            <button
              type="button"
              onClick={async () => {
                if (!confirm('Remove this card?')) return;
                await onDelete();
              }}
              className="rounded-xl bg-red-900/60 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-900"
            >
              Delete
            </button>
          ) : null}
          <button
            type="button"
            disabled={submitting}
            onClick={submit}
            className="rounded-xl bg-indigo-500 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-400 disabled:opacity-60"
          >
            {submitting ? 'Saving…' : submitLabel}
          </button>
        </div>
      </div>

      <div className="space-y-5 rounded-2xl border border-white/10 bg-[#16213e] p-6">
        <div>
          <div className="mb-2 text-sm font-semibold text-slate-300">Card (pick or type custom)</div>
          <input
            className="w-full rounded-xl border border-white/10 bg-[#0b1020] px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Search or type name…"
            value={search || name}
            onChange={(e) => {
              const t = e.target.value;
              setSearch(t);
              const match = catalog.find((c) => c.name.toLowerCase() === t.toLowerCase());
              if (match) {
                selectFromCatalog(match);
              } else {
                setName(t);
                setImageUrl(null);
                setCatalogId(null);
              }
            }}
          />

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={useCustom}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-indigo-300 hover:bg-white/10"
            >
              Use custom name
            </button>
            {imageUrl ? (
              <span className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                Image linked
              </span>
            ) : null}
          </div>

          <div className="mt-4">
            <div className="mb-2 text-xs font-semibold text-slate-400">Catalog</div>
            {loadingCatalog ? (
              <div className="text-sm text-slate-300">Loading catalog…</div>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {filteredCatalog.slice(0, 8).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => selectFromCatalog(c)}
                    className={[
                      'rounded-xl border px-4 py-3 text-left text-sm font-semibold transition',
                      name === c.name
                        ? 'border-indigo-400/60 bg-indigo-400/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10',
                    ].join(' ')}
                  >
                    <div className="truncate">{c.name}</div>
                    {c.bank ? <div className="mt-1 text-xs text-slate-400">{c.bank}</div> : null}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DayGrid label="Cycle start day (1-31)" value={cycleStartDay} onChange={setCycleStartDay} />
        <DayGrid label="Cycle end day (1-31)" value={cycleEndDay} onChange={setCycleEndDay} />

        <div>
          <div className="mb-2 text-sm font-semibold text-slate-300">Due date</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setDueDateMode('days')}
              className={[
                'rounded-lg px-3 py-2 text-sm font-semibold',
                dueDateMode === 'days' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10',
              ].join(' ')}
            >
              By days
            </button>
            <button
              type="button"
              onClick={() => setDueDateMode('date')}
              className={[
                'rounded-lg px-3 py-2 text-sm font-semibold',
                dueDateMode === 'date' ? 'bg-indigo-500 text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10',
              ].join(' ')}
            >
              By date
            </button>
          </div>

          {dueDateMode === 'days' ? (
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-400">Days after cycle end</div>
              <div className="mt-2 flex flex-wrap gap-2">
                {[...new Set([...DUE_DAYS_OPTIONS, dueDateDays])]
                  .sort((a, b) => a - b)
                  .map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDueDateDays(d)}
                      className={[
                        'rounded-lg px-3 py-2 text-sm font-semibold',
                        dueDateDays === d
                          ? 'bg-indigo-500 text-white'
                          : 'bg-[#0b1020] text-slate-300 hover:bg-white/10',
                      ].join(' ')}
                    >
                      {d}
                    </button>
                  ))}
              </div>
              <div className="mt-2 text-sm text-slate-300">
                Falls on <span className="font-semibold">{ordinalDay(dueDayOfMonth)}</span> of month
              </div>
            </div>
          ) : (
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-400">Date of month (e.g. 1st, 15th)</div>
              <div className="mt-2 grid grid-cols-8 gap-2 sm:grid-cols-10">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDueDateDays(dueDayOfMonthToDays(cycleEnd, d))}
                    className={[
                      'rounded-lg px-2 py-2 text-sm font-semibold',
                      dueDayOfMonth === d
                        ? 'bg-indigo-500 text-white'
                        : 'bg-[#0b1020] text-slate-300 hover:bg-white/10',
                    ].join(' ')}
                  >
                    {d}
                  </button>
                ))}
              </div>
              <div className="mt-2 text-sm text-slate-300">
                <span className="font-semibold">{dueDateDays}</span> days after cycle end
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

