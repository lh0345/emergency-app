import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppText } from '@/components/ui/AppText';
import { SUPPLY_CATEGORIES } from '@/constants/categories';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useSupplies } from '@/hooks/useSupplies';
import type { SupplyCategory } from '@/types';

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
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim()) return;
    const q = Number(quantity);
    if (Number.isNaN(q)) return;
    setSaving(true);
    try {
      await addSupply({
        name: name.trim(),
        category,
        quantity: q,
        unit: unit.trim() || 'units',
        expiryDate: expiryDate.trim() || null,
        location: location.trim() || null,
        notes: notes.trim() || null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="label">Name</AppText>
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
          Unit
        </AppText>
        <AppInput value={unit} onChangeText={setUnit} placeholder="bottles, cans, days…" />

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
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.xs },
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
});
