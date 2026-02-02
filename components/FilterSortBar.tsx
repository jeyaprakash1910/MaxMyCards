import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type MonthFilter = 'past' | 'current' | 'next';
export type SortBy = 'due' | 'cycle';
export type SortDir = 'asc' | 'desc';

/** Default sort when user taps a month: Past=days_to_due ASC, Current=days_to_due DESC, Next=days_to_due ASC */
export function getDefaultSortForMonth(month: MonthFilter): { sortBy: SortBy; sortDir: SortDir } {
  switch (month) {
    case 'past':
      return { sortBy: 'due', sortDir: 'asc' };   // earliest due first
    case 'current':
      return { sortBy: 'due', sortDir: 'desc' };  // latest due first
    case 'next':
      return { sortBy: 'due', sortDir: 'asc' };   // earliest due first
  }
}

type Props = {
  month: MonthFilter;
  onMonthChange: (m: MonthFilter) => void;
  sortBy: SortBy;
  onSortByChange: (s: SortBy) => void;
  sortDir: SortDir;
  onSortDirChange: (d: SortDir) => void;
};

export function FilterSortBar({
  month,
  onMonthChange,
  sortBy,
  onSortByChange,
  sortDir,
  onSortDirChange,
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Month</Text>
        <View style={styles.buttonRow}>
          {(['past', 'current', 'next'] as const).map((m) => (
            <TouchableOpacity
              key={m}
              style={[styles.btn, month === m && styles.btnActive, m !== 'past' && styles.btnMargin]}
              onPress={() => onMonthChange(m)}
            >
              <Text style={[styles.btnText, month === m && styles.btnTextActive]}>
                {m === 'past' ? 'Past' : m === 'current' ? 'Current' : 'Next'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Sort by</Text>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.btn, sortBy === 'due' && styles.btnActive]}
            onPress={() => onSortByChange('due')}
          >
            <Text style={[styles.btnText, sortBy === 'due' && styles.btnTextActive]}>Due</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.btn, styles.btnMargin, sortBy === 'cycle' && styles.btnActive]}
            onPress={() => onSortByChange('cycle')}
          >
            <Text style={[styles.btnText, sortBy === 'cycle' && styles.btnTextActive]}>Cycle</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Order</Text>
        <View style={styles.arrowRow}>
          <TouchableOpacity
            style={[styles.arrowBtn, sortDir === 'asc' && styles.btnActive]}
            onPress={() => onSortDirChange('asc')}
          >
            <Text style={[styles.arrowText, sortDir === 'asc' && styles.btnTextActive]}>↑</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.arrowBtn, styles.btnMargin, sortDir === 'desc' && styles.btnActive]}
            onPress={() => onSortDirChange('desc')}
          >
            <Text style={[styles.arrowText, sortDir === 'desc' && styles.btnTextActive]}>↓</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
  },
  section: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  sectionLabel: {
    color: '#64748b',
    fontSize: 12,
    marginRight: 6,
  },
  buttonRow: {
    flexDirection: 'row',
  },
  arrowRow: {
    flexDirection: 'row',
  },
  btn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#0f3460',
  },
  btnMargin: {
    marginLeft: 4,
  },
  btnActive: {
    backgroundColor: '#6366f1',
  },
  btnText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '500',
  },
  btnTextActive: {
    color: '#fff',
  },
  arrowBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#0f3460',
  },
  arrowText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '600',
  },
});
