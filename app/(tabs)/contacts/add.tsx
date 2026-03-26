import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useContacts } from '@/hooks/useContacts';
import type { ContactRow } from '@/types';

const TYPES: ContactRow['type'][] = ['emergency', 'family', 'out_of_town', 'other'];

export default function AddContactScreen() {
  const router = useRouter();
  const { addContact } = useContacts();
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [type, setType] = useState<ContactRow['type']>('family');
  const [notes, setNotes] = useState('');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!name.trim() || !phone.trim()) return;
    setSaving(true);
    try {
      await addContact({
        name: name.trim(),
        phone: phone.trim(),
        type,
        notes: notes.trim() || null,
        meetingLocation: meetingLocation.trim() || null,
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
          Meeting point / notes
        </AppText>
        <AppInput value={meetingLocation} onChangeText={setMeetingLocation} placeholder="Optional" />

        <AppText variant="label" style={styles.label}>
          Notes
        </AppText>
        <AppInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Optional"
          multiline
          style={{ minHeight: 80, textAlignVertical: 'top' }}
        />

        <AppButton title="Save contact" loading={saving} onPress={() => void save()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.xs },
  label: { marginTop: spacing.md, marginBottom: spacing.xs },
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
