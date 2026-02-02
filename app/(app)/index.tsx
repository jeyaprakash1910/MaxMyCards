import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { signOut } from '@/lib/auth';
import type { CreditCard, CreditCardWithComputed } from '@/lib/types';
import { getCurrentCycle, getNextDueDate, getPastCycle, getNextCycle } from '@/lib/cycleUtils';
import { CardListItem } from '@/components/CardListItem';
import {
  FilterSortBar,
  type MonthFilter,
  type SortBy,
  type SortDir,
  getDefaultSortForMonth,
} from '@/components/FilterSortBar';

function computeCard(card: CreditCard): CreditCardWithComputed {
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
function getDaysToDue(card: CreditCardWithComputed, month: MonthFilter): number {
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

function sortCards(
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

export default function HomeScreen() {
  const [cards, setCards] = useState<CreditCardWithComputed[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('credit_cards')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setCards([]);
      return;
    }

    const computed = (data ?? []).map(computeCard);
    setCards(computed);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchCards().finally(() => setLoading(false));
    }, [fetchCards])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCards();
    setRefreshing(false);
  }, [fetchCards]);

  const sortedCards = useMemo(
    () => sortCards(cards, month, sortBy, sortDir),
    [cards, month, sortBy, sortDir]
  );

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>My Credit Cards</Text>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <FilterSortBar
        month={month}
        onMonthChange={handleMonthChange}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        sortDir={sortDir}
        onSortDirChange={setSortDir}
      />

      {loading ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Loading...</Text>
        </View>
      ) : sortedCards.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>No cards yet</Text>
          <Text style={styles.emptySub}>Add your first credit card</Text>
        </View>
      ) : (
        <FlatList
          data={sortedCards}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <CardListItem
              card={item}
              month={month}
              onPress={() => router.push(`/(app)/edit-card/${item.id}`)}
            />
          )}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366f1" />
          }
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/(app)/add-card')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
  },
  logoutBtn: {
    padding: 8,
  },
  logoutText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 18,
  },
  emptySub: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6366f1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 32,
  },
});
