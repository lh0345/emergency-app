import React from 'react';
import { StyleSheet, View } from 'react-native';

import { spacing } from '@/constants/spacing';

import { AppText } from './AppText';

export function SectionTitle({ children }: { children: string }) {
  return (
    <View style={styles.wrap}>
      <AppText variant="label" style={styles.text}>
        {children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.sm },
  text: { textTransform: 'uppercase', letterSpacing: 1 },
});
