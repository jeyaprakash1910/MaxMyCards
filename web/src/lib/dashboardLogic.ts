import type { CreditCard, CreditCardWithComputed } from './types';
import { getCurrentCycle, getNextDueDate, getNextCycle, getPastCycle } from './cycleUtils';

export type MonthFilter = 'past' | 'current' | 'next';
export type SortBy = 'due' | 'cycle';
export type SortDir = 'asc' | 'desc';

export function getDefaultSortForMonth(month: MonthFilter): { sortBy: SortBy; sortDir: SortDir } {
  switch (month) {
    case 'past':
      return { sortBy: 'due', sortDir: 'asc' };
    case 'current':
      return { sortBy: 'due', sortDir: 'desc' };
    case 'next':
      return { sortBy: 'due', sortDir: 'asc' };
  }
}

export function computeCard(card: CreditCard): CreditCardWithComputed {
  const { cycleStart, cycleEnd, daysLeftInCycle } = getCurrentCycle(
    card.cycle_start_day,
    card.cycle_end_day
  );
  const { dueDate, daysUntilDue } = getNextDueDate(cycleEnd, card.due_date_days);
  const { cycleStart: pastCycleStart, cycleEnd: pastCycleEnd } = getPastCycle(
    card.cycle_start_day,
    card.cycle_end_day
  );
  const { cycleStart: nextCycleStart, cycleEnd: nextCycleEnd } = getNextCycle(
    card.cycle_start_day,
    card.cycle_end_day
  );
  const pastDueDate = new Date(pastCycleEnd);
  pastDueDate.setDate(pastDueDate.getDate() + card.due_date_days);
  const nextDueDate = new Date(nextCycleEnd);
  nextDueDate.setDate(nextDueDate.getDate() + card.due_date_days);
  return {
    ...card,
    cycleStart,
    cycleEnd,
    daysLeftInCycle,
    dueDate,
    daysUntilDue,
    pastCycleStart,
    pastCycleEnd,
    pastDueDate,
    nextCycleStart,
    nextCycleEnd,
    nextDueDate,
  };
}

/** days_to_due for the active tab (negative = overdue in Past). */
export function getDaysToDue(card: CreditCardWithComputed, month: MonthFilter): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (month === 'past') {
    const d = new Date(card.pastDueDate);
    d.setHours(0, 0, 0, 0);
    return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }
  if (month === 'current') return card.daysUntilDue;
  const d = new Date(card.nextDueDate);
  d.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function getSortDate(card: CreditCardWithComputed, month: MonthFilter, sortBy: SortBy): Date {
  if (sortBy === 'due') {
    return month === 'past' ? card.pastDueDate : month === 'next' ? card.nextDueDate : card.dueDate;
  }
  return month === 'past' ? card.pastCycleEnd : month === 'next' ? card.nextCycleEnd : card.cycleEnd;
}

export function sortCards(
  cards: CreditCardWithComputed[],
  month: MonthFilter,
  sortBy: SortBy,
  sortDir: SortDir
): CreditCardWithComputed[] {
  const copy = [...cards];
  const mult = sortDir === 'asc' ? 1 : -1;
  if (sortBy === 'due') {
    copy.sort((a, b) => mult * (getDaysToDue(a, month) - getDaysToDue(b, month)));
  } else {
    copy.sort((a, b) => {
      const ta = getSortDate(a, month, sortBy).getTime();
      const tb = getSortDate(b, month, sortBy).getTime();
      return mult * (ta - tb);
    });
  }
  return copy;
}

