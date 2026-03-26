import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { useEmergencyMode } from '@/hooks/useEmergencyMode';
import { useOfflineStatus } from '@/hooks/useOfflineStatus';
import { useSettings } from '@/hooks/useSettings';

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { openEmergencyHome } = useEmergencyMode();
  const { offline } = useOfflineStatus();
  const { holdMs } = useSettings();
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const diameter = shortSide > 0 ? Math.min(260, Math.max(132, shortSide * 0.56)) : 220;
  const holdSeconds = Math.round(holdMs / 100) / 10;

  return (
    <Screen>
      <View style={styles.root}>
        {offline ? (
          <View
            style={[
              styles.offlineBanner,
              {
                backgroundColor: theme.surfaceElevated,
                borderBottomColor: theme.border,
              },
            ]}
            accessibilityRole="alert"
          >
            <AppText variant="caption" style={{ color: theme.text, textAlign: 'center' }}>
              Offline — your data stays on this device.
            </AppText>
          </View>
        ) : null}
        <View style={styles.center}>
        <Pressable
          onLongPress={openEmergencyHome}
          accessibilityLabel="Emergency. Press and hold to open emergency mode."
          accessibilityHint={`Hold for about ${holdSeconds} seconds.`}
          accessibilityRole="button"
          delayLongPress={holdMs}
          style={({ pressed }) => [
            styles.circle,
            {
              width: diameter,
              height: diameter,
              borderRadius: diameter / 2,
              backgroundColor: pressed ? '#b91c1c' : '#dc2626',
              opacity: pressed ? 0.95 : 1,
            },
          ]}
        >
          <View style={styles.circleContent} collapsable={false}>
            <Text style={styles.labelEmergency}>Emergency Button</Text>
            <Text style={styles.labelPressHold}>press and hold</Text>
          </View>
        </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  offlineBanner: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    alignItems: 'stretch',
    justifyContent: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.22,
    shadowRadius: 10,
    elevation: 8,
  },
  circleContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  labelPressHold: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  labelEmergency: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
});
