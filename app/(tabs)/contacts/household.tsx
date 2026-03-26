import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useHouseholdProfile } from '@/hooks/useHouseholdProfile';

export default function HouseholdProfileScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { profile, loading, save } = useHouseholdProfile();

  const [peopleCount, setPeopleCount] = useState('1');
  const [adults, setAdults] = useState('1');
  const [children, setChildren] = useState('0');
  const [dietaryNotes, setDietaryNotes] = useState('');
  const [medicineNotes, setMedicineNotes] = useState('');
  const [waterUsePerDay, setWaterUsePerDay] = useState('2');
  const [foodUsePerDay, setFoodUsePerDay] = useState('2000');
  const [heatingType, setHeatingType] = useState('');
  const [cookingType, setCookingType] = useState('');
  const [vehicleFuelAccess, setVehicleFuelAccess] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setPeopleCount(String(profile.peopleCount));
    setAdults(String(profile.adults));
    setChildren(String(profile.children));
    setDietaryNotes(profile.dietaryNotes);
    setMedicineNotes(profile.medicineNotes);
    setWaterUsePerDay(String(profile.waterUsePerDay));
    setFoodUsePerDay(String(profile.foodUsePerDay));
    setHeatingType(profile.heatingType);
    setCookingType(profile.cookingType);
    setVehicleFuelAccess(profile.vehicleFuelAccess);
  }, [profile]);

  const onSave = async () => {
    setSaving(true);
    try {
      await save({
        peopleCount: Math.max(1, parseInt(peopleCount, 10) || 1),
        adults: Math.max(0, parseInt(adults, 10) || 0),
        children: Math.max(0, parseInt(children, 10) || 0),
        dietaryNotes: dietaryNotes.trim(),
        medicineNotes: medicineNotes.trim(),
        waterUsePerDay: Math.max(0.1, parseFloat(waterUsePerDay) || 2),
        foodUsePerDay: Math.max(1, parseFloat(foodUsePerDay) || 2000),
        heatingType: heatingType.trim(),
        cookingType: cookingType.trim(),
        vehicleFuelAccess: vehicleFuelAccess.trim(),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen back title="Household profile">
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
                backgroundColor: theme.contactsBanner,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={[styles.heroIcon, { backgroundColor: theme.contactsMuted }]}>
              <Ionicons name="people-outline" size={22} color={theme.contactsAccent} />
            </View>
            <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.xs }}>
              Resilience profile
            </AppText>
            <AppText muted variant="caption" style={{ lineHeight: 20 }}>
              Used to estimate water and food coverage from your supplies. Everything stays on this device.
            </AppText>
          </View>

          {loading ? (
            <AppText style={{ color: theme.textMuted }}>Loading…</AppText>
          ) : null}

          <AppText variant="label" style={{ color: theme.text }}>
            People (total)
          </AppText>
          <AppInput value={peopleCount} onChangeText={setPeopleCount} keyboardType="number-pad" />

          <AppText variant="label" style={styles.label}>
            Adults / children
          </AppText>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AppInput value={adults} onChangeText={setAdults} keyboardType="number-pad" placeholder="Adults" />
            </View>
            <View style={{ flex: 1 }}>
              <AppInput value={children} onChangeText={setChildren} keyboardType="number-pad" placeholder="Children" />
            </View>
          </View>

          <AppText variant="label" style={styles.label}>
            Dietary notes
          </AppText>
          <AppInput
            value={dietaryNotes}
            onChangeText={setDietaryNotes}
            multiline
            placeholder="Allergies, infants, special diets"
            style={{ minHeight: 64, textAlignVertical: 'top' }}
          />

          <AppText variant="label" style={styles.label}>
            Medicine notes
          </AppText>
          <AppInput
            value={medicineNotes}
            onChangeText={setMedicineNotes}
            multiline
            placeholder="Chronic conditions, prescriptions to prioritize"
            style={{ minHeight: 64, textAlignVertical: 'top' }}
          />

          <AppText variant="label" style={styles.label}>
            Household water use (L/day, rough)
          </AppText>
          <AppInput value={waterUsePerDay} onChangeText={setWaterUsePerDay} keyboardType="decimal-pad" />

          <AppText variant="label" style={styles.label}>
            Food energy (kcal/person/day, rough)
          </AppText>
          <AppInput value={foodUsePerDay} onChangeText={setFoodUsePerDay} keyboardType="number-pad" />

          <AppText variant="label" style={styles.label}>
            Heating type
          </AppText>
          <AppInput value={heatingType} onChangeText={setHeatingType} placeholder="e.g. Heat pump, wood stove" />

          <AppText variant="label" style={styles.label}>
            Cooking type
          </AppText>
          <AppInput value={cookingType} onChangeText={setCookingType} placeholder="e.g. Gas range, induction, camping stove" />

          <AppText variant="label" style={styles.label}>
            Vehicle / fuel access
          </AppText>
          <AppInput
            value={vehicleFuelAccess}
            onChangeText={setVehicleFuelAccess}
            placeholder="e.g. One car, usually half tank"
          />

          <AppButton title="Save profile" loading={saving} onPress={() => void onSave()} />
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
    marginBottom: spacing.sm,
  },
  label: { marginTop: spacing.md, marginBottom: spacing.xs },
  row: { flexDirection: 'row', gap: spacing.sm },
});
