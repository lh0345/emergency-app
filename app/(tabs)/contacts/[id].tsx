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
import { AppInput } from '@/components/ui/AppInput';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import { openDialer, openSms } from '@/utils/linking';
import type { ContactRow } from '@/types';

const TYPES: ContactRow['type'][] = ['emergency', 'family', 'out_of_town', 'other'];

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
      <View style={styles.center}>
        <AppText>Invalid contact.</AppText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.surface }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.actions}>
          <AppButton title="Call" style={styles.half} onPress={() => void openDialer(phone)} />
          <AppButton
            title="SMS"
            variant="secondary"
            style={styles.half}
            onPress={() => void openSms(phone)}
          />
        </View>

        <AppText variant="label">Name</AppText>
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
                style={[
                  styles.chip,
                  {
                    borderColor: selected ? theme.accent : theme.border,
                    backgroundColor: selected ? theme.surfaceElevated : 'transparent',
                  },
                ]}
              >
                <AppText style={{ fontSize: 13 }}>{t.replace('_', ' ')}</AppText>
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
  actions: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  half: { flex: 1 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    borderWidth: 2,
    borderRadius: 999,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 44,
    justifyContent: 'center',
  },
});
