import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppInput } from '@/components/ui/AppInput';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { HOLD_MS_MAX, HOLD_MS_MIN } from '@/constants/settingsKeys';
import { screenPadding } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useSettings } from '@/hooks/useSettings';

export default function AppSettingsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { smsDefaultBody, holdMs, saveSmsDefaultBody, saveHoldMs } = useSettings();

  const [smsDraft, setSmsDraft] = useState(smsDefaultBody);
  const [holdDraft, setHoldDraft] = useState(String(holdMs));

  useEffect(() => {
    setSmsDraft(smsDefaultBody);
  }, [smsDefaultBody]);

  useEffect(() => {
    setHoldDraft(String(holdMs));
  }, [holdMs]);

  const save = async () => {
    await saveSmsDefaultBody(smsDraft);
    const n = parseInt(holdDraft.replace(/\D/g, ''), 10);
    if (Number.isFinite(n)) {
      await saveHoldMs(n);
    }
  };

  return (
    <Screen back title="App settings">
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
              <Ionicons name="settings-outline" size={22} color={theme.contactsAccent} />
            </View>
            <AppText variant="title" style={{ color: theme.text, marginBottom: spacing.xs }}>
              Preferences
            </AppText>
            <AppText muted variant="caption" style={{ lineHeight: 20 }}>
              Defaults are stored on this device only. SMS preset opens in the composer when you tap SMS on a contact.
            </AppText>
          </View>

          <AppText variant="label" style={{ color: theme.text }}>
            Default SMS message
          </AppText>
          <AppInput
            value={smsDraft}
            onChangeText={setSmsDraft}
            placeholder="I am safe."
            multiline
            style={{ minHeight: 72, textAlignVertical: 'top' }}
          />

          <AppText variant="label" style={styles.label}>
            Emergency button hold (milliseconds)
          </AppText>
          <AppText muted variant="caption" style={styles.hint}>
            Long-press duration on the Home screen before emergency mode opens. Allowed: {HOLD_MS_MIN}–{HOLD_MS_MAX}.
          </AppText>
          <AppInput
            value={holdDraft}
            onChangeText={setHoldDraft}
            keyboardType="number-pad"
            placeholder="700"
          />

          <AppButton title="Save" onPress={() => void save()} />
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
  hint: { marginBottom: spacing.sm, lineHeight: 18 },
});
