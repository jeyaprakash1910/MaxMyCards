import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export type SortOrder = 'due_soonest' | 'due_later' | 'cycle_soonest' | 'cycle_later';

type Props = {
  value: SortOrder;
  onChange: (value: SortOrder) => void;
};

export function SortToggle({ value, onChange }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.option, value === 'due_soonest' && styles.optionActive]}
          onPress={() => onChange('due_soonest')}
        >
          <Text style={[styles.optionText, value === 'due_soonest' && styles.optionTextActive]}>
            Due soonest
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, value === 'due_later' && styles.optionActive]}
          onPress={() => onChange('due_later')}
        >
          <Text style={[styles.optionText, value === 'due_later' && styles.optionTextActive]}>
            Due later
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.option, value === 'cycle_soonest' && styles.optionActive]}
          onPress={() => onChange('cycle_soonest')}
        >
          <Text style={[styles.optionText, value === 'cycle_soonest' && styles.optionTextActive]}>
            Cycle soonest
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.option, value === 'cycle_later' && styles.optionActive]}
          onPress={() => onChange('cycle_later')}
        >
          <Text style={[styles.optionText, value === 'cycle_later' && styles.optionTextActive]}>
            Cycle later
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#16213e',
    borderRadius: 10,
    padding: 4,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  option: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  optionActive: {
    backgroundColor: '#6366f1',
  },
  optionText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#fff',
  },
});
