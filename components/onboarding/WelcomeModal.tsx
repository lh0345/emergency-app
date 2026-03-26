import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';

type Props = {
  visible: boolean;
  onContinue: () => void;
};

const BULLETS: { title: string; body: string }[] = [
  {
    title: 'Two modes',
    body: 'Prepare — track supplies, plans, and guides. Emergency — press and hold the red button for guided steps when something is wrong.',
  },
  {
    title: 'Prepare tab',
    body: 'Stock, checklists, and offline reading live in one place so you are not hunting five tabs.',
  },
  {
    title: 'People tab',
    body: 'Contacts, household size for estimates, and meeting places.',
  },
  {
    title: 'Privacy',
    body: 'Information stays on this device. Works without the internet.',
  },
];

export function WelcomeModal({ visible, onContinue }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onContinue}>
      <Pressable style={[styles.backdrop, { backgroundColor: 'rgba(0,0,0,0.45)' }]} onPress={onContinue}>
        <Pressable
          style={[styles.sheet, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}
          onPress={(e) => e.stopPropagation()}
        >
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scroll}
            keyboardShouldPersistTaps="handled"
          >
            <AppText variant="title" style={{ color: theme.text }}>
              How this app works
            </AppText>
            <AppText muted variant="caption" style={styles.intro}>
              A quick overview before you start.
            </AppText>

            {BULLETS.map((b) => (
              <View key={b.title} style={styles.block}>
                <AppText variant="subtitle" style={{ color: theme.text }}>
                  {b.title}
                </AppText>
                <AppText muted variant="caption" style={styles.blockBody}>
                  {b.body}
                </AppText>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <AppButton title="Continue" onPress={onContinue} accessibilityLabel="Continue" />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: screenPadding,
  },
  sheet: {
    maxHeight: '88%',
    borderRadius: radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  scroll: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  intro: {
    marginTop: spacing.xs,
    marginBottom: spacing.md,
    lineHeight: 18,
  },
  block: {
    marginBottom: spacing.md,
  },
  blockBody: {
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
    paddingTop: spacing.sm,
  },
});
