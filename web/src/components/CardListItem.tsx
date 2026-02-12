'use client';

import Link from 'next/link';
import type { CreditCardWithComputed } from '@/lib/types';
import type { MonthFilter } from '@/lib/dashboardLogic';
import { formatCycleRange, formatDueDate } from '@/lib/cycleUtils';

function daysSince(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.max(0, Math.floor((today.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)));
}

function daysUntil(date: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return Math.max(0, Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
}

function isBeforeToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

const RED = '#f87171';
const YELLOW = '#eab308';
const FOREST_GREEN = '#228b22';

function hexToRgb(hex: string): [number, number, number] {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (x: number) => Math.round(Math.max(0, Math.min(255, x)));
  return `#${[r, g, b]
    .map((c) => clamp(c).toString(16).padStart(2, '0'))
    .join('')}`;
}
function lerpColor(hex1: string, hex2: string, t: number): string {
  const t2 = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return rgbToHex(r1 + (r2 - r1) * t2, g1 + (g2 - g1) * t2, b1 + (b2 - b1) * t2);
}

function getPastDueColor(daysToDue: number): string {
  if (daysToDue <= 0) return RED;
  const t = (daysToDue - 1) / (22 - 1);
  return t >= 1 ? FOREST_GREEN : lerpColor(YELLOW, FOREST_GREEN, t);
}
function getCurrentDueColor(daysToDue: number): string {
  const MIN = 20;
  const MAX = 52;
  const t = (daysToDue - MIN) / (MAX - MIN);
  return t <= 0 ? YELLOW : t >= 1 ? FOREST_GREEN : lerpColor(YELLOW, FOREST_GREEN, t);
}
function getNextDueColor(daysToDue: number): string {
  const MIN = 36;
  const MAX = 82;
  const t = (daysToDue - MIN) / (MAX - MIN);
  return t <= 0 ? YELLOW : t >= 1 ? FOREST_GREEN : lerpColor(YELLOW, FOREST_GREEN, t);
}

function getDaysToDueForDisplay(card: CreditCardWithComputed, month: MonthFilter, dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dueDate);
  d.setHours(0, 0, 0, 0);
  const days = Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (month === 'current') return card.daysUntilDue;
  return days;
}

export function CardListItem({ card, month }: { card: CreditCardWithComputed; month: MonthFilter }) {
  const daysSinceStart = daysSince(card.cycleStart);

  const cycleStart =
    month === 'past' ? card.pastCycleStart : month === 'next' ? card.nextCycleStart : card.cycleStart;
  const cycleEnd =
    month === 'past' ? card.pastCycleEnd : month === 'next' ? card.nextCycleEnd : card.cycleEnd;
  const dueDate = month === 'past' ? card.pastDueDate : month === 'next' ? card.nextDueDate : card.dueDate;

  const isPast = month === 'past';
  const isNext = month === 'next';
  const nextDaysUntilStart = isNext ? daysUntil(card.nextCycleStart) : 0;
  const pastDueOverdue = isPast && isBeforeToday(dueDate);

  const daysToDue = getDaysToDueForDisplay(card, month, dueDate);
  const dueColor =
    month === 'past' ? getPastDueColor(daysToDue) : month === 'current' ? getCurrentDueColor(daysToDue) : getNextDueColor(daysToDue);

  return (
    <Link
      href={`/app/cards/${card.id}`}
      className="group flex gap-4 rounded-xl border border-white/10 bg-[#16213e] p-4 hover:border-white/20"
    >
      <div className="h-12 w-16 overflow-hidden rounded-lg bg-[#0f3460]">
        {card.image_url ? (
          // Using <img> avoids Next/Image remote URL config friction.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={card.image_url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-lg font-extrabold text-indigo-400">{card.name.charAt(0).toUpperCase()}</span>
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="truncate text-base font-semibold text-white">{card.name}</div>
            <div className="mt-1 text-sm text-slate-300">
              <span className="text-slate-400">Cycle:</span>{' '}
              {formatCycleRange(cycleStart, cycleEnd)}
              {isPast && ' · Ended'}
              {month === 'current' && ` · ${daysSinceStart} days in · ${card.daysLeftInCycle} days left`}
              {isNext && ` · Starts in ${nextDaysUntilStart} days`}
            </div>
            <div className="mt-1 text-sm font-semibold" style={{ color: dueColor }}>
              <span className="font-semibold text-slate-400">Due:</span>{' '}
              {formatDueDate(dueDate)}
              {month === 'current' && ` · ${card.daysUntilDue} days`}
              {isPast && pastDueOverdue && ' [Past Due]'}
              {isPast && !pastDueOverdue && ` · ${daysToDue} days`}
              {isNext && ` · ${daysUntil(dueDate)} days`}
            </div>
          </div>

          <div className="hidden shrink-0 text-sm font-semibold text-slate-400 group-hover:text-white sm:block">
            Edit →
          </div>
        </div>
      </div>
    </Link>
  );
}

