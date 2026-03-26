import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import type { SavedLocationType } from '@/types';

const TYPES: SavedLocationType[] = ['meeting', 'evacuation', 'shelter', 'other'];

function typeLabel(t: SavedLocationType) {
  return t.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function NewSavedLocationScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { db, ready } = useDatabase();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<SavedLocationType>('meeting');

  const save = async () => {
    if (!db || !name.trim() || !address.trim()) return;
    await Q.insertSavedLocation(db, {
      name: name.trim(),
      address: address.trim(),
      type,
    });
    router.back();
  };

  return (
    <Screen back title="Add location">
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
              <Ionicons name="add-circle-outline" size={22} color={theme.contactsAccent} />
            </View>
            <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.xs }}>
              New location
            </AppText>
            <AppText muted variant="caption" style={{ lineHeight: 20 }}>
              Name it so you recognize it under stress; add enough address detail to navigate.
            </AppText>
          </View>

          <AppText variant="label" style={{ color: theme.text }}>
            Name
          </AppText>
          <AppInput value={name} onChangeText={setName} placeholder="e.g. School rally point" />

          <AppText variant="label" style={styles.label}>
            Address
          </AppText>
          <AppInput
            value={address}
            onChangeText={setAddress}
            placeholder="Street, city"
            multiline
            style={{ minHeight: 72, textAlignVertical: 'top' }}
          />

          <AppText variant="label" style={styles.label}>
            Type
          </AppText>
          <View style={styles.row}>
            {TYPES.map((t) => {
              const selected = type === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setType(t)}
                  style={({ pressed }) => [
                    styles.chip,
                    {
                      minHeight: minTouchTarget,
                      borderColor: selected ? theme.contactsAccent : theme.border,
                      backgroundColor: selected ? theme.contactsMuted : 'transparent',
                      opacity: pressed ? 0.92 : 1,
                    },
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                >
                  <AppText style={{ fontSize: 14, color: theme.text, fontWeight: selected ? '600' : '400' }}>
                    {typeLabel(t)}
                  </AppText>
                </Pressable>
              );
            })}
          </View>

          <AppButton
            title="Save location"
            disabled={!ready || !name.trim() || !address.trim()}
            onPress={() => void save()}
          />
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
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 2,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    justifyContent: 'center',
  },
});
