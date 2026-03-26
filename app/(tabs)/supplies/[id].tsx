import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppText } from '@/components/ui/AppText';
import { SUPPLY_CATEGORIES } from '@/constants/categories';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import { calculateDaysLeft } from '@/utils/calculateDaysLeft';
import { formatDate } from '@/utils/formatDate';
import type { SupplyCategory, SupplyRow } from '@/types';

export default function SupplyDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { db, ready } = useDatabase();

  const [row, setRow] = useState<SupplyRow | null>(null);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplyCategory>('Water');
  const [quantity, setQuantity] = useState('');
  const [unit, setUnit] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const load = useCallback(async () => {
    if (!db || !Number.isFinite(id)) return;
    setLoading(true);
    const s = await Q.getSupply(db, id);
    setRow(s);
    if (s) {
      setName(s.name);
      setCategory(s.category);
      setQuantity(String(s.quantity));
      setUnit(s.unit);
      setExpiryDate(s.expiryDate ?? '');
      setLocation(s.location ?? '');
      setNotes(s.notes ?? '');
    }
    setLoading(false);
  }, [db, id]);

  useEffect(() => {
    if (ready && db) void load();
  }, [ready, db, load]);

  const save = async () => {
    if (!db || !name.trim()) return;
    const q = Number(quantity);
    if (Number.isNaN(q)) return;
    await Q.updateSupply(db, id, {
      name: name.trim(),
      category,
      quantity: q,
      unit: unit.trim() || 'units',
      expiryDate: expiryDate.trim() || null,
      location: location.trim() || null,
      notes: notes.trim() || null,
    });
    await load();
  };

  const remove = () => {
    Alert.alert('Delete item?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!db) return;
          await Q.deleteSupply(db, id);
          router.back();
        },
      },
    ]);
  };

  const days = calculateDaysLeft(row?.expiryDate ?? null);

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <View style={styles.center}>
        <AppText>Invalid item.</AppText>
      </View>
    );
  }

  if (loading || !row) {
    return (
      <View style={[styles.center, { backgroundColor: theme.surface }]}>
        <ActivityIndicator color={theme.accent} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        {days !== null ? (
          <AppText style={{ marginBottom: spacing.md }}>
            {days < 0
              ? `Expired ${Math.abs(days)} day(s) ago`
              : days === 0
                ? 'Expires today'
                : `~${days} day(s) to expiry`}
            {row.expiryDate ? ` · ${formatDate(row.expiryDate)}` : ''}
          </AppText>
        ) : null}

        <AppText variant="label">Name</AppText>
        <AppInput value={name} onChangeText={setName} />

        <AppText variant="label" style={styles.label}>
          Category
        </AppText>
        <View style={styles.catRow}>
          {SUPPLY_CATEGORIES.map((c) => {
            const selected = category === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCategory(c)}
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? theme.accent : theme.border,
                    backgroundColor: selected ? theme.surfaceElevated : 'transparent',
                  },
                ]}
              >
                <AppText>{c}</AppText>
              </Pressable>
            );
          })}
        </View>

        <AppText variant="label" style={styles.label}>
          Quantity
        </AppText>
        <AppInput value={quantity} onChangeText={setQuantity} keyboardType="decimal-pad" />

        <AppText variant="label" style={styles.label}>
          Quick adjust
        </AppText>
        <View style={styles.row}>
          <AppButton
            title="-1"
            variant="secondary"
            style={styles.mini}
            onPress={() => {
              const q = Number(quantity);
              if (!Number.isNaN(q)) setQuantity(String(Math.max(0, q - 1)));
            }}
          />
          <AppButton
            title="+1"
            variant="secondary"
            style={styles.mini}
            onPress={() => {
              const q = Number(quantity);
              if (!Number.isNaN(q)) setQuantity(String(q + 1));
            }}
          />
        </View>

        <AppText variant="label" style={styles.label}>
          Unit
        </AppText>
        <AppInput value={unit} onChangeText={setUnit} />

        <AppText variant="label" style={styles.label}>
          Expiry (YYYY-MM-DD)
        </AppText>
        <AppInput value={expiryDate} onChangeText={setExpiryDate} />

        <AppText variant="label" style={styles.label}>
          Location
        </AppText>
        <AppInput value={location} onChangeText={setLocation} />

        <AppText variant="label" style={styles.label}>
          Notes
        </AppText>
        <AppInput
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ minHeight: 72, textAlignVertical: 'top' }}
        />

        <AppButton title="Save" onPress={() => void save()} />
        <AppButton title="Delete" variant="ghost" onPress={remove} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  label: { marginTop: spacing.md, marginBottom: spacing.xs },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 2,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
  row: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  mini: { flex: 1, minHeight: 44 },
});
