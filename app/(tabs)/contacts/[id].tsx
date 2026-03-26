import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppCard } from '@/components/ui/AppCard';
import { AppInput } from '@/components/ui/AppInput';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import { openDialer, openSms } from '@/utils/linking';
import type { ContactRow } from '@/types';

const TYPES: ContactRow['type'][] = ['emergency', 'family', 'out_of_town', 'other'];

function typeLabel(t: ContactRow['type']) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function ContactDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Number(Array.isArray(rawId) ? rawId[0] : rawId);
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { db, ready } = useDatabase();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<ContactRow['type']>('family');
  const [notes, setNotes] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');

  const load = useCallback(async () => {
    if (!db || !Number.isFinite(id)) return;
    const c = await Q.getContact(db, id);
    if (c) {
      setName(c.name);
      setPhone(c.phone);
      setType(c.type);
      setNotes(c.notes ?? '');
      setMeetingLocation(c.meetingLocation ?? '');
    }
  }, [db, id]);

  useEffect(() => {
    if (ready && db) void load();
  }, [ready, db, load]);

  const save = async () => {
    if (!db || !name.trim() || !phone.trim()) return;
    await Q.updateContact(db, id, {
      name: name.trim(),
      phone: phone.trim(),
      type,
      notes: notes.trim() || null,
      meetingLocation: meetingLocation.trim() || null,
    });
    await load();
  };

  const remove = () => {
    Alert.alert('Delete contact?', undefined, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!db) return;
          await Q.deleteContact(db, id);
          router.back();
        },
      },
    ]);
  };

  if (!Number.isFinite(id) || id <= 0) {
    return (
      <Screen back title="Contact">
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <AppText style={{ color: theme.text }}>Invalid contact.</AppText>
          <AppButton title="Go back" onPress={() => router.back()} style={{ marginTop: spacing.lg }} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen back title={name.trim() ? name : 'Contact'}>
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
            <Ionicons name="person-circle-outline" size={32} color={theme.contactsAccent} />
          </View>
          <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.xs }}>
            {name.trim() ? name : 'Contact'}
          </AppText>
          <AppText muted variant="caption" style={{ lineHeight: 20 }}>
            Call or message below, then update details if needed.
          </AppText>
        </View>

        <AppCard
          style={[
            styles.actionCard,
            {
              borderRadius: radius.lg,
              borderLeftWidth: 4,
              borderLeftColor: theme.contactsAccent,
            },
          ]}
        >
          <View style={styles.actionsRow}>
            <AppButton
              title="Call"
              style={styles.half}
              onPress={() => void openDialer(phone)}
            />
            <AppButton
              title="SMS"
              variant="secondary"
              style={styles.half}
              onPress={() => void openSms(phone)}
            />
          </View>
        </AppCard>

        <AppText variant="label" style={{ color: theme.text }}>
          Name
        </AppText>
        <AppInput value={name} onChangeText={setName} />
        <AppText variant="label" style={styles.label}>
          Phone
        </AppText>
        <AppInput value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

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

        <AppText variant="label" style={styles.label}>
          Meeting point
        </AppText>
        <AppInput value={meetingLocation} onChangeText={setMeetingLocation} />

        <AppText variant="label" style={styles.label}>
          Notes
        </AppText>
        <AppInput
          value={notes}
          onChangeText={setNotes}
          multiline
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <AppButton title="Save changes" onPress={() => void save()} />
        <AppButton title="Delete contact" variant="ghost" onPress={remove} />
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
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  actionCard: { marginBottom: spacing.lg, paddingVertical: spacing.md },
  actionsRow: { flexDirection: 'row', gap: spacing.sm },
  half: { flex: 1 },
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
