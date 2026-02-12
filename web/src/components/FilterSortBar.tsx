'use client';

import type { MonthFilter, SortBy, SortDir } from '@/lib/dashboardLogic';

type Props = {
  month: MonthFilter;
  onMonthChange: (m: MonthFilter) => void;
  sortBy: SortBy;
  onSortByChange: (s: SortBy) => void;
  sortDir: SortDir;
  onSortDirChange: (d: SortDir) => void;
};

function TabButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-lg px-3 py-2 text-sm font-semibold transition',
        active ? 'bg-indigo-500 text-white' : 'bg-[#0f3460] text-slate-300 hover:text-white',
      ].join(' ')}
    >
      {children}
    </button>
  );
}

export function FilterSortBar({
  month,
  onMonthChange,
  sortBy,
  onSortByChange,
  sortDir,
  onSortDirChange,
}: Props) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-[#16213e] p-3">
      <div className="flex items-center gap-2">
        <div className="text-xs font-semibold text-slate-400">Month</div>
        <div className="flex items-center gap-2">
          <TabButton active={month === 'past'} onClick={() => onMonthChange('past')}>
            Past
          </TabButton>
          <TabButton active={month === 'current'} onClick={() => onMonthChange('current')}>
            Current
          </TabButton>
          <TabButton active={month === 'next'} onClick={() => onMonthChange('next')}>
            Next
          </TabButton>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs font-semibold text-slate-400">Sort by</div>
        <div className="flex items-center gap-2">
          <TabButton active={sortBy === 'due'} onClick={() => onSortByChange('due')}>
            Due
          </TabButton>
          <TabButton active={sortBy === 'cycle'} onClick={() => onSortByChange('cycle')}>
            Cycle
          </TabButton>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="text-xs font-semibold text-slate-400">Order</div>
        <div className="flex items-center gap-2">
          <TabButton active={sortDir === 'asc'} onClick={() => onSortDirChange('asc')}>
            ↑
          </TabButton>
          <TabButton active={sortDir === 'desc'} onClick={() => onSortDirChange('desc')}>
            ↓
          </TabButton>
        </div>
      </div>
    </div>
  );
}

