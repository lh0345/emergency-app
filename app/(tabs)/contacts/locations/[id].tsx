import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
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

export default function SavedLocationDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { db, ready } = useDatabase();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [type, setType] = useState<SavedLocationType>('meeting');
  const [loading, setLoading] = useState(true);
  const [found, setFound] = useState(false);

  const load = useCallback(async () => {
    if (!Number.isFinite(id) || id <= 0) {
      setFound(false);
      setLoading(false);
      return;
    }
    if (!db) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const row = await Q.getSavedLocation(db, id);
    if (row) {
      setFound(true);
      setName(row.name);
      setAddress(row.address);
      setType(row.type);
    } else {
      setFound(false);
    }
    setLoading(false);
  }, [db, id]);

  useFocusEffect(
    useCallback(() => {
      if (ready && db) void load();
    }, [ready, db, load])
  );

  const save = async () => {
    if (!db || !name.trim() || !address.trim()) return;
    await Q.updateSavedLocation(db, id, {
      name: name.trim(),
      address: address.trim(),
      type,
    });
    await load();
  };

  const remove = () => {
    Alert.alert('Delete this location?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!db) return;
          await Q.deleteSavedLocation(db, id);
          router.back();
        },
      },
    ]);
  };

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <Screen back title="Location">
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <AppText style={{ color: theme.text }}>Invalid location.</AppText>
          <AppButton title="Go back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen back title="Location">
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <ActivityIndicator color={theme.contactsAccent} />
        </View>
      </Screen>
    );
  }

  if (!found) {
    return (
      <Screen back title="Location">
        <View style={[styles.center, { backgroundColor: theme.surface, padding: spacing.lg }]}>
          <AppText variant="subtitle" style={{ color: theme.text, textAlign: 'center' }}>
            Location not found. It may have been deleted.
          </AppText>
          <AppButton title="Back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen back title={name.trim() ? name : 'Location'}>
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
              <Ionicons name="location" size={22} color={theme.contactsAccent} />
            </View>
            <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.xs }}>
              {name.trim() ? name : 'Location'}
            </AppText>
            <AppText muted variant="caption" style={{ lineHeight: 20 }}>
              Update details if your household plan changes.
            </AppText>
          </View>

          <AppText variant="label" style={{ color: theme.text }}>
            Name
          </AppText>
          <AppInput value={name} onChangeText={setName} />

          <AppText variant="label" style={styles.label}>
            Address
          </AppText>
          <AppInput
            value={address}
            onChangeText={setAddress}
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

          <AppButton title="Save changes" onPress={() => void save()} />
          <AppButton title="Delete location" variant="ghost" onPress={remove} />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
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
