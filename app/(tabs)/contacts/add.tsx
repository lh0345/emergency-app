import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { minTouchTarget, radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useContacts } from '@/hooks/useContacts';
import type { ContactRow } from '@/types';

const TYPES: ContactRow['type'][] = ['emergency', 'family', 'out_of_town', 'other'];

function typeLabel(t: ContactRow['type']) {
  return t.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

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
    <Screen back title="Add contact">
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
            <Ionicons name="person-add" size={22} color={theme.contactsAccent} />
          </View>
          <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.sm }}>
            Add a contact
          </AppText>
          <AppText muted variant="caption" style={{ lineHeight: 20 }}>
            Name and phone are required. Type helps you sort who to call first.
          </AppText>
        </View>

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
