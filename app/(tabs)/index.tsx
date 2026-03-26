import React from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { Screen } from '@/components/ui/Screen';
import { useColorScheme } from '@/components/useColorScheme';
import { getThemeColors } from '@/constants/Colors';
import { useEmergencyMode } from '@/hooks/useEmergencyMode';

const HOLD_MS = 700;

export default function HomeScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const { openEmergencyHome } = useEmergencyMode();
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const diameter = shortSide > 0 ? Math.max(160, shortSide * 0.9) : 280;

  return (
    <Screen>
      <View style={styles.center}>
        <Pressable
          onLongPress={openEmergencyHome}
          accessibilityLabel="Emergency. Press and hold to open emergency mode."	
          accessibilityHint={`Hold for about ${Math.round(HOLD_MS / 100) / 10} seconds.`}
          accessibilityRole="button"
          delayLongPress={HOLD_MS}
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
    </Screen>
  );
}

const styles = StyleSheet.create({
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 14,
  },
  circleContent: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  labelPressHold: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  labelEmergency: {
    color: '#ffffff',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: '700',
  },
});
