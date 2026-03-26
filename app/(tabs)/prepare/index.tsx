import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppCard } from '@/components/ui/AppCard';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';

type HubItem = {
  title: string;
  subtitle: string;
  href: '/supplies' | '/plans' | '/library';
  icon: keyof typeof Ionicons.glyphMap;
  accent: string;
};

export default function PrepareHubScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();

  const items: HubItem[] = [
    {
      title: 'Stock & targets',
      subtitle: 'Water, food, power, medicine — what you have and rough “days left”.',
      href: '/supplies',
      icon: 'cube-outline',
      accent: theme.suppliesAccent,
    },
    {
      title: 'Plans & checklists',
      subtitle: 'Your lists for outages, go-bags, and drills — templates or blank.',
      href: '/plans',
      icon: 'list-outline',
      accent: theme.plansAccent,
    },
    {
      title: 'Guides',
      subtitle: 'Read offline: first aid, shelter, and self-reliance topics.',
      href: '/library',
      icon: 'book-outline',
      accent: theme.libraryAccent,
    },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <AppText variant="title" style={{ color: theme.text }}>
            Prepare
          </AppText>
          <AppText muted variant="caption" style={styles.headerSub}>
            Everything for before something happens — stock, lists, and reading. People and meeting
            places are under People.
          </AppText>
        </View>

        {items.map((item) => (
          <Pressable
            key={item.href}
            onPress={() => router.push(item.href)}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}. ${item.subtitle}`}
          >
            <AppCard
              style={[
                styles.card,
                {
                  borderRadius: radius.lg,
                  borderLeftWidth: 3,
                  borderLeftColor: item.accent,
                },
              ]}
            >
              <View style={styles.cardRow}>
                <View style={[styles.iconWrap, { backgroundColor: theme.surface }]}>
                  <Ionicons name={item.icon} size={26} color={item.accent} />
                </View>
                <View style={styles.cardText}>
                  <AppText variant="subtitle" style={{ color: theme.text }}>
                    {item.title}
                  </AppText>
                  <AppText muted variant="caption" style={styles.cardSub}>
                    {item.subtitle}
                  </AppText>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.textMuted} />
              </View>
            </AppCard>
          </Pressable>
        ))}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: screenPadding,
    paddingBottom: spacing.xxl,
    paddingTop: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  headerSub: {
    marginTop: spacing.xs,
    lineHeight: 20,
  },
  card: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
    minWidth: 0,
  },
  cardSub: {
    marginTop: 4,
    lineHeight: 18,
  },
});
