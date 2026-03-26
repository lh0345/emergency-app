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

import { Ionicons } from '@expo/vector-icons';
import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppInput } from '@/components/ui/AppInput';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { SUPPLY_CATEGORIES } from '@/constants/categories';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
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
      <Screen back title="Supply">
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <AppText style={{ color: theme.text }}>Invalid item.</AppText>
        </View>
      </Screen>
    );
  }

  if (loading || !row) {
    return (
      <Screen back title="Supply">
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <ActivityIndicator color={theme.suppliesAccent} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen back title={name.trim() || 'Supply'}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: theme.surface }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.hero,
              {
                backgroundColor: theme.suppliesBanner,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={[styles.heroIcon, { backgroundColor: theme.suppliesMuted }]}>
              <Ionicons name="create-outline" size={26} color={theme.suppliesAccent} />
            </View>
            <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.xs }}>
              {name.trim() || 'Supply'}
            </AppText>
            <AppText muted variant="caption" style={{ lineHeight: 20 }}>
              Update quantity, location, or expiry. Save when you are done.
            </AppText>
          </View>

          {days !== null ? (
            <AppCard
              style={[
                styles.expiryCard,
                {
                  borderRadius: radius.lg,
                  borderLeftWidth: 4,
                  borderLeftColor:
                    days < 0 ? theme.danger : days <= 30 ? theme.warning : theme.suppliesAccent,
                },
              ]}
            >
              <View style={styles.expiryRow}>
                <Ionicons
                  name={days < 0 ? 'alert-circle' : 'calendar-outline'}
                  size={22}
                  color={days < 0 ? theme.danger : days <= 30 ? theme.warning : theme.suppliesAccent}
                />
                <AppText style={{ color: theme.text, flex: 1, marginLeft: spacing.sm, lineHeight: 22 }}>
                  {days < 0
                    ? `Expired ${Math.abs(days)} day(s) ago`
                    : days === 0
                      ? 'Expires today'
                      : `About ${days} day(s) to expiry`}
                  {row.expiryDate ? ` · ${formatDate(row.expiryDate)}` : ''}
                </AppText>
              </View>
            </AppCard>
          ) : null}

          <AppText variant="label" style={{ color: theme.text }}>
            Name
          </AppText>
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
                style={({ pressed }) => [
                  styles.chip,
                  {
                    minHeight: minTouchTarget,
                    borderColor: selected ? theme.suppliesAccent : theme.border,
                    backgroundColor: selected ? theme.suppliesMuted : 'transparent',
                    opacity: pressed ? 0.92 : 1,
                  },
                ]}
              >
                <AppText style={{ fontSize: 14, color: theme.text, fontWeight: selected ? '600' : '400' }}>
                  {c}
                </AppText>
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
        <AppCard
          style={[
            styles.quickCard,
            {
              borderRadius: radius.lg,
              borderLeftWidth: 3,
              borderLeftColor: theme.suppliesAccent,
            },
          ]}
        >
          <View style={styles.row}>
            <AppButton
              title="−1"
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
        </AppCard>

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

        <AppButton title="Save changes" onPress={() => void save()} />
        <AppButton title="Delete item" variant="ghost" onPress={remove} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: screenPadding, paddingBottom: spacing.xxl },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  expiryCard: { marginBottom: spacing.lg, paddingVertical: spacing.md },
  expiryRow: { flexDirection: 'row', alignItems: 'center' },
  label: { marginTop: spacing.md, marginBottom: spacing.xs },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
  quickCard: { marginBottom: spacing.sm, paddingVertical: spacing.md },
  row: { flexDirection: 'row', gap: spacing.sm },
  mini: { flex: 1, minHeight: 44 },
});
