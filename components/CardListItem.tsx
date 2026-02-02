import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import type { CreditCardWithComputed } from '@/lib/types';
import { formatCycleRange, formatDueDate, getStatementStatus } from '@/lib/cycleUtils';
import { DUE_COLOR_THRESHOLDS, COLORS } from '@/lib/colorThresholds';
import type { MonthFilter } from './FilterSortBar';

type Props = {
  card: CreditCardWithComputed;
  month: MonthFilter;
  onPress: () => void;
};

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
  return Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function isBeforeToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

/** days_to_due for display/color: can be negative for overdue in any view. */
function getDaysToDue(card: CreditCardWithComputed, month: MonthFilter, dueDate: Date): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dueDate);
  d.setHours(0, 0, 0, 0);
  const days = Math.floor((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (month === 'current') return card.daysUntilDue;
  return days;
}

const { RED, YELLOW, FOREST_GREEN } = COLORS;

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (x: number) => Math.round(Math.max(0, Math.min(255, x)));
  return '#' + [r, g, b].map((c) => clamp(c).toString(16).padStart(2, '0')).join('');
}
function lerpColor(hex1: string, hex2: string, t: number): string {
  const t2 = Math.max(0, Math.min(1, t));
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  return rgbToHex(r1 + (r2 - r1) * t2, g1 + (g2 - g1) * t2, b1 + (b2 - b1) * t2);
}

/** PAST: days_to_due <= 0 → RED; else linear gradient from MIN_SAFE (YELLOW) to MAX_SAFE (GREEN). */
function getPastDueColor(daysToDue: number): { color: string } {
  if (daysToDue <= 0) return { color: RED };
  const { MIN_SAFE, MAX_SAFE } = DUE_COLOR_THRESHOLDS.PAST;
  const t = (daysToDue - MIN_SAFE) / (MAX_SAFE - MIN_SAFE);
  const color = t >= 1 ? FOREST_GREEN : lerpColor(YELLOW, FOREST_GREEN, t);
  return { color };
}

/** CURRENT: Overdue (≤0) → RED; else gradient MIN_SAFE (YELLOW) to MAX_SAFE (GREEN). */
function getCurrentDueColor(daysToDue: number): { color: string } {
  // CRITICAL FIX: Show red for overdue cards in current view
  if (daysToDue <= 0) return { color: RED };
  const { MIN_SAFE, MAX_SAFE } = DUE_COLOR_THRESHOLDS.CURRENT;
  const t = (daysToDue - MIN_SAFE) / (MAX_SAFE - MIN_SAFE);
  const color = t <= 0 ? YELLOW : t >= 1 ? FOREST_GREEN : lerpColor(YELLOW, FOREST_GREEN, t);
  return { color };
}

/** NEXT: No red (future date). Gradient MIN_SAFE (YELLOW) to MAX_SAFE (GREEN). */
function getNextDueColor(daysToDue: number): { color: string } {
  const { MIN_SAFE, MAX_SAFE } = DUE_COLOR_THRESHOLDS.NEXT;
  const t = (daysToDue - MIN_SAFE) / (MAX_SAFE - MIN_SAFE);
  const color = t <= 0 ? YELLOW : t >= 1 ? FOREST_GREEN : lerpColor(YELLOW, FOREST_GREEN, t);
  return { color };
}

export function CardListItem({ card, month, onPress }: Props) {
  const daysSinceStart = daysSince(card.cycleStart);

  const cycleStart = month === 'past' ? card.pastCycleStart : month === 'next' ? card.nextCycleStart : card.cycleStart;
  const cycleEnd = month === 'past' ? card.pastCycleEnd : month === 'next' ? card.nextCycleEnd : card.cycleEnd;
  const dueDate = month === 'past' ? card.pastDueDate : month === 'next' ? card.nextDueDate : card.dueDate;

  const isPast = month === 'past';
  const isNext = month === 'next';
  const isCurrent = month === 'current';
  const nextDaysUntilStart = isNext ? daysUntil(card.nextCycleStart) : 0;
  const pastDueOverdue = isPast && isBeforeToday(dueDate);
  const pastDueDaysLeft = isPast && !pastDueOverdue ? daysUntil(dueDate) : 0;

  // Get statement status for current view
  const statementStatus = isCurrent ? getStatementStatus(cycleEnd) : null;

  const daysToDue = getDaysToDue(card, month, dueDate);
  const dueColor =
    month === 'past'
      ? getPastDueColor(daysToDue)
      : month === 'current'
        ? getCurrentDueColor(daysToDue)
        : getNextDueColor(daysToDue);

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {card.image_url ? (
          <Image source={{ uri: card.image_url }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              {card.name.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {card.name}
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>Cycle:</Text>
          <Text style={styles.value}>
            {formatCycleRange(cycleStart, cycleEnd)}
            {isPast && ` · Ended`}
            {isCurrent && statementStatus && (
              statementStatus.closed 
                ? ` · Statement closed ${statementStatus.daysSinceClosed} days ago`
                : statementStatus.daysUntilClose === 0
                ? ` · Statement closes today`
                : ` · Statement closes in ${statementStatus.daysUntilClose} days`
            )}
            {isNext && ` · Starts in ${nextDaysUntilStart} days`}
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Due:</Text>
          <Text
            style={[
              styles.value,
              dueColor,
            ]}
          >
            {formatDueDate(dueDate)}
            {month === 'current' && (card.daysUntilDue === 0
              ? ` · Due today`
              : card.daysUntilDue < 0 
              ? ` · Overdue`
              : ` · ${card.daysUntilDue} days`
            )}
            {isPast && pastDueOverdue && ` · Overdue`}
            {isPast && !pastDueOverdue && ` · ${daysToDue} days`}
            {isNext && ` · ${daysUntil(dueDate)} days`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  imageContainer: {
    width: 56,
    height: 40,
    marginRight: 12,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholder: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#0f3460',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    color: '#6366f1',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  label: {
    color: '#94a3b8',
    fontSize: 13,
    marginRight: 6,
  },
  value: {
    color: '#e2e8f0',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
});
