import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { AppText } from '@/components/ui/AppText';
import { spacing } from '@/constants/spacing';
import { usePlans } from '@/hooks/usePlans';

export default function NewPlanScreen() {
  const router = useRouter();
  const { addPlan } = usePlans();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Home');
  const [summary, setSummary] = useState('');
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await addPlan({ title: title.trim(), type: type.trim(), summary: summary.trim() });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scroll}>
        <AppText variant="label" style={styles.label}>
          Title
        </AppText>
        <AppInput value={title} onChangeText={setTitle} placeholder="e.g. Home evacuation" />
        <AppText variant="label" style={styles.label}>
          Type
        </AppText>
        <AppInput value={type} onChangeText={setType} placeholder="e.g. Evacuation" />
        <AppText variant="label" style={styles.label}>
          Summary
        </AppText>
        <AppInput
          value={summary}
          onChangeText={setSummary}
          placeholder="Short summary"
          multiline
          style={{ minHeight: 100, textAlignVertical: 'top' }}
        />
        <AppButton title="Save plan" loading={saving} onPress={() => void save()} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: spacing.lg, gap: spacing.sm },
  label: { marginTop: spacing.md, marginBottom: spacing.xs },
});
