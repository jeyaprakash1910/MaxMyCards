import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { fetchCardCatalog, searchCatalog, type CatalogCard } from '@/lib/catalog';
import type { CreditCard } from '@/lib/types';
import {
  getCurrentCycle,
  dueDateDaysToDayOfMonth,
  dueDayOfMonthToDays,
  ordinalDay,
} from '@/lib/cycleUtils';
import { isDayEdgeCase, getEdgeCaseWarning } from '@/lib/dateValidation';

const CYCLE_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const DUE_DAYS_OPTIONS = [14, 15, 18, 20, 21, 24, 25, 28, 30];
const DUE_DATE_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function EditCardScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [catalog, setCatalog] = useState<CatalogCard[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [catalogId, setCatalogId] = useState<string | null>(null);
  const [cycleStartDay, setCycleStartDay] = useState(14);
  const [cycleEndDay, setCycleEndDay] = useState(13);
  const [dueDateDays, setDueDateDays] = useState(21);
  const [dueDateMode, setDueDateMode] = useState<'days' | 'date'>('days');

  const filteredCatalog = searchCatalog(catalog, search);

  const { cycleEnd } = getCurrentCycle(cycleStartDay, cycleEndDay);
  const dueDayOfMonth = dueDateDaysToDayOfMonth(cycleEnd, dueDateDays);

  useEffect(() => {
    fetchCardCatalog().then(setCatalog);
  }, []);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data, error } = await supabase
        .from('credit_cards')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        Alert.alert('Error', 'Card not found');
        router.back();
        return;
      }

      const card = data as CreditCard;
      setName(card.name);
      setImageUrl(card.image_url);
      setCatalogId(card.catalog_id);
      setCycleStartDay(card.cycle_start_day);
      setCycleEndDay(card.cycle_end_day);
      setDueDateDays(card.due_date_days);
    })().finally(() => setLoading(false));
  }, [id]);

  const selectFromCatalog = (card: CatalogCard) => {
    setName(card.name);
    setImageUrl(card.image_url);
    setCatalogId(card.id);
  };

  const useCustom = () => {
    setImageUrl(null);
    setCatalogId(null);
  };

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a card name');
      return;
    }
    if (!id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('credit_cards')
        .update({
          name: trimmed,
          image_url: imageUrl,
          catalog_id: catalogId,
          cycle_start_day: cycleStartDay,
          cycle_end_day: cycleEndDay,
          due_date_days: dueDateDays,
        })
        .eq('id', id);

      if (error) throw error;
      router.back();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to save';
      Alert.alert('Error', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete', 'Remove this card?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!id) return;
          try {
            const { error } = await supabase.from('credit_cards').delete().eq('id', id);
            if (error) throw error;
            router.back();
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : 'Failed to delete card';
            Alert.alert('Error', msg);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loading}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.cancel}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Card</Text>
        <TouchableOpacity onPress={handleSave} disabled={saving}>
          <Text style={[styles.save, saving && styles.saveDisabled]}>
            {saving ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>Card name</Text>
        <TextInput
          style={styles.input}
          placeholder="Card name"
          placeholderTextColor="#94a3b8"
          value={search || name}
          onChangeText={(t) => {
            setSearch(t);
            setName(t);
          }}
        />

        <View style={styles.catalogList}>
          {filteredCatalog.slice(0, 6).map((card) => (
            <TouchableOpacity
              key={card.id}
              style={[styles.catalogItem, name === card.name && styles.catalogItemSelected]}
              onPress={() => selectFromCatalog(card)}
            >
              <Text style={styles.catalogName}>{card.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.customBtn} onPress={useCustom}>
          <Text style={styles.customBtnText}>Use custom</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Cycle start day (1-31)</Text>
        {isDayEdgeCase(cycleStartDay) && (
          <Text style={styles.warningText}>{getEdgeCaseWarning(cycleStartDay)}</Text>
        )}
        <View style={styles.pickerRow}>
          {CYCLE_DAYS.slice(0, 16).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.pickerItem, cycleStartDay === d && styles.pickerItemActive]}
              onPress={() => setCycleStartDay(d)}
            >
              <Text style={[styles.pickerText, cycleStartDay === d && styles.pickerTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.pickerRow}>
          {CYCLE_DAYS.slice(16, 31).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.pickerItem, cycleStartDay === d && styles.pickerItemActive]}
              onPress={() => setCycleStartDay(d)}
            >
              <Text style={[styles.pickerText, cycleStartDay === d && styles.pickerTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Cycle end day (1-31)</Text>
        {isDayEdgeCase(cycleEndDay) && (
          <Text style={styles.warningText}>{getEdgeCaseWarning(cycleEndDay)}</Text>
        )}
        <View style={styles.pickerRow}>
          {CYCLE_DAYS.slice(0, 16).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.pickerItem, cycleEndDay === d && styles.pickerItemActive]}
              onPress={() => setCycleEndDay(d)}
            >
              <Text style={[styles.pickerText, cycleEndDay === d && styles.pickerTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.pickerRow}>
          {CYCLE_DAYS.slice(16, 31).map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.pickerItem, cycleEndDay === d && styles.pickerItemActive]}
              onPress={() => setCycleEndDay(d)}
            >
              <Text style={[styles.pickerText, cycleEndDay === d && styles.pickerTextActive]}>
                {d}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Due date</Text>
        <View style={styles.modeToggle}>
          <TouchableOpacity
            style={[styles.modeBtn, dueDateMode === 'days' && styles.modeBtnActive]}
            onPress={() => setDueDateMode('days')}
          >
            <Text style={[styles.modeBtnText, dueDateMode === 'days' && styles.modeBtnTextActive]}>
              By days
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, dueDateMode === 'date' && styles.modeBtnActive]}
            onPress={() => setDueDateMode('date')}
          >
            <Text style={[styles.modeBtnText, dueDateMode === 'date' && styles.modeBtnTextActive]}>
              By date
            </Text>
          </TouchableOpacity>
        </View>

        {dueDateMode === 'days' ? (
          <>
            <Text style={styles.sublabel}>Days after cycle end</Text>
            <View style={styles.pickerRow}>
              {[...new Set([...DUE_DAYS_OPTIONS, dueDateDays])].sort((a, b) => a - b).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.pickerItem, dueDateDays === d && styles.pickerItemActive]}
                  onPress={() => setDueDateDays(d)}
                >
                  <Text style={[styles.pickerText, dueDateDays === d && styles.pickerTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.hint}>
              Falls on {ordinalDay(dueDayOfMonth)} of month
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.sublabel}>Date of month (e.g. 1st, 15th)</Text>
            <View style={styles.pickerRow}>
              {DUE_DATE_DAYS.slice(0, 16).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.pickerItem, dueDayOfMonth === d && styles.pickerItemActive]}
                  onPress={() => setDueDateDays(dueDayOfMonthToDays(cycleEnd, d))}
                >
                  <Text style={[styles.pickerText, dueDayOfMonth === d && styles.pickerTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={styles.pickerRow}>
              {DUE_DATE_DAYS.slice(16, 31).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.pickerItem, dueDayOfMonth === d && styles.pickerItemActive]}
                  onPress={() => setDueDateDays(dueDayOfMonthToDays(cycleEnd, d))}
                >
                  <Text style={[styles.pickerText, dueDayOfMonth === d && styles.pickerTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.hint}>
              {dueDateDays} days after cycle end
            </Text>
          </>
        )}

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Text style={styles.deleteBtnText}>Delete Card</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#94a3b8',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#16213e',
  },
  cancel: {
    color: '#94a3b8',
    fontSize: 16,
  },
  title: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  save: {
    color: '#6366f1',
    fontSize: 16,
    fontWeight: '600',
  },
  saveDisabled: {
    opacity: 0.5,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 8,
    marginTop: 16,
  },
  sublabel: {
    color: '#64748b',
    fontSize: 12,
    marginBottom: 8,
    marginTop: 4,
  },
  hint: {
    color: '#64748b',
    fontSize: 13,
    marginTop: 8,
    fontStyle: 'italic',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#16213e',
    borderRadius: 8,
  },
  modeBtnActive: {
    backgroundColor: '#6366f1',
  },
  modeBtnText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  modeBtnTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#16213e',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 16,
  },
  catalogList: {
    marginTop: 8,
  },
  catalogItem: {
    padding: 12,
    backgroundColor: '#16213e',
    borderRadius: 8,
    marginBottom: 6,
  },
  catalogItemSelected: {
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  catalogName: {
    color: '#fff',
    fontSize: 15,
  },
  customBtn: {
    marginTop: 12,
    padding: 8,
  },
  customBtnText: {
    color: '#6366f1',
    fontSize: 14,
  },
  pickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: '#16213e',
    borderRadius: 8,
  },
  pickerItemActive: {
    backgroundColor: '#6366f1',
  },
  pickerText: {
    color: '#94a3b8',
    fontSize: 14,
  },
  pickerTextActive: {
    color: '#fff',
  },
  deleteBtn: {
    marginTop: 32,
    padding: 16,
    backgroundColor: '#7f1d1d',
    borderRadius: 12,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#fca5a5',
    fontSize: 16,
  },
  warningText: {
    color: '#f59e0b',
    fontSize: 12,
    marginTop: 4,
    marginBottom: 8,
    fontStyle: 'italic',
  },
});
