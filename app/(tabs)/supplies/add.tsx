import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { SUBCATEGORY_HINTS, SUPPLY_CATEGORIES } from '@/constants/categories';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useSupplies } from '@/hooks/useSupplies';
import type { RestockPriority, SupplyCategory } from '@/types';

const RESTOCK: RestockPriority[] = ['low', 'normal', 'high', 'urgent'];

export default function AddSupplyScreen() {
  const router = useRouter();
  const { addSupply } = useSupplies();
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<SupplyCategory>('Water');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('units');
  const [expiryDate, setExpiryDate] = useState('');
  const [location, setLocation] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [dailyUse, setDailyUse] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [restockPriority, setRestockPriority] = useState<RestockPriority>('normal');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    const q = Number(quantity);
    if (Number.isNaN(q)) return;
    const du = parseFloat(dailyUse);
    const ta = parseFloat(targetAmount);
    setSaving(true);
    try {
      await addSupply({
        name: name.trim(),
        category,
        subcategory: subcategory.trim(),
        quantity: q,
        unit: unit.trim() || 'units',
        expiryDate: expiryDate.trim() || null,
        location: location.trim() || null,
        notes: notes.trim() || null,
        dailyUse: Number.isFinite(du) ? du : 0,
        targetAmount: Number.isFinite(ta) ? ta : 0,
        restockPriority,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen back title="Add supply">
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
              <Ionicons name="add-circle-outline" size={22} color={theme.suppliesAccent} />
            </View>
            <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.sm }}>
              New item
            </AppText>
            <AppText muted variant="caption" style={{ lineHeight: 20 }}>
              Set daily use and targets to estimate days left and restock urgency.
            </AppText>
          </View>

          <AppText muted variant="caption" style={{ lineHeight: 18, marginBottom: spacing.sm }}>
            Hints for {category}: {SUBCATEGORY_HINTS[category].join(', ') || '—'}
          </AppText>

          <AppText variant="label" style={{ color: theme.text }}>
            Name
          </AppText>
          <AppInput value={name} onChangeText={setName} placeholder="e.g. Bottled water" />

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
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
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
            Unit
          </AppText>
          <AppInput value={unit} onChangeText={setUnit} placeholder="bottles, cans, days…" />

          <AppText variant="label" style={styles.label}>
            Subcategory (optional)
          </AppText>
          <AppInput value={subcategory} onChangeText={setSubcategory} placeholder="e.g. Stored water" />

          <AppText variant="label" style={styles.label}>
            Daily use (same unit as quantity)
          </AppText>
          <AppInput
            value={dailyUse}
            onChangeText={setDailyUse}
            keyboardType="decimal-pad"
            placeholder="0 = unknown"
          />

          <AppText variant="label" style={styles.label}>
            Target amount
          </AppText>
          <AppInput
            value={targetAmount}
            onChangeText={setTargetAmount}
            keyboardType="decimal-pad"
            placeholder="Goal stock level"
          />

          <AppText variant="label" style={styles.label}>
            Restock priority
          </AppText>
          <View style={styles.catRow}>
            {RESTOCK.map((rp) => {
              const selected = restockPriority === rp;
              return (
                <Pressable
                  key={rp}
                  onPress={() => setRestockPriority(rp)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      minHeight: minTouchTarget,
                      borderColor: selected ? theme.suppliesAccent : theme.border,
                      backgroundColor: selected ? theme.suppliesMuted : 'transparent',
                      opacity: pressed ? 0.92 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <AppText style={{ fontSize: 13, color: theme.text, fontWeight: selected ? '600' : '400' }}>
                    {rp}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppText variant="label" style={styles.label}>
            Expiry (YYYY-MM-DD)
          </AppText>
          <AppInput value={expiryDate} onChangeText={setExpiryDate} placeholder="Optional" />

          <AppText variant="label" style={styles.label}>
            Location
          </AppText>
          <AppInput value={location} onChangeText={setLocation} placeholder="Optional" />

          <AppText variant="label" style={styles.label}>
            Notes
          </AppText>
          <AppInput
            value={notes}
            onChangeText={setNotes}
            placeholder="Optional"
            multiline
            style={{ minHeight: 72, textAlignVertical: 'top' }}
          />

          <AppButton title="Save supply" loading={saving} onPress={() => void save()} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: screenPadding, paddingBottom: spacing.xxl, gap: spacing.xs },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  label: { marginTop: spacing.md, marginBottom: spacing.xs },
  catRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
});
