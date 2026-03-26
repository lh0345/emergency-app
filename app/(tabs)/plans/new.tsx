import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { usePlans } from '@/hooks/usePlans';

export default function NewPlanScreen() {
  const router = useRouter();
  const { addPlan } = usePlans();
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
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
    <Screen back title="New plan">
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
                backgroundColor: theme.plansBanner,
                borderColor: theme.border,
              },
            ]}
          >
            <View style={[styles.heroIcon, { backgroundColor: theme.plansMuted }]}>
              <Ionicons name="document-text-outline" size={28} color={theme.plansAccent} />
            </View>
            <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.sm }}>
              Start a plan
            </AppText>
            <AppText muted variant="caption" style={{ lineHeight: 20 }}>
              Give it a clear title. You will add checklist steps on the next screen.
            </AppText>
          </View>

          <AppText variant="label" style={{ color: theme.text }}>
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
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingHorizontal: screenPadding, paddingBottom: spacing.xxl, gap: spacing.sm },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  label: { marginTop: spacing.md, marginBottom: spacing.xs },
});
