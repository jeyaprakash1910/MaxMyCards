'use client';

export function DayGrid({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
}) {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-slate-300">{label}</div>
      <div className="grid grid-cols-8 gap-2 sm:grid-cols-10">
        {days.map((d) => {
          const active = d === value;
          return (
            <button
              key={d}
              type="button"
              onClick={() => onChange(d)}
              className={[
                'rounded-lg px-2 py-2 text-sm font-semibold transition',
                active ? 'bg-indigo-500 text-white' : 'bg-[#16213e] text-slate-300 hover:text-white',
              ].join(' ')}
            >
              {d}
            </button>
          );
        })}
      </div>
    </div>
  );
}

