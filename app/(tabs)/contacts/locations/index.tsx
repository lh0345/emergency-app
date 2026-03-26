import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { SavedLocationRow } from '@/components/contacts/SavedLocationRow';
import { AppButton } from '@/components/ui/AppButton';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding, scrollBottomInsetAboveFooter } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { useSavedLocations } from '@/hooks/useSavedLocations';
import { useTabBarFooterPadding } from '@/hooks/useTabBarFooterPadding';

export default function SavedLocationsListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const { locations, loading, refresh } = useSavedLocations();
  const footerPad = useTabBarFooterPadding();

  useFocusEffect(
    useCallback(() => {
      if (ready && !error) void refresh({ silent: true });
    }, [ready, error, refresh])
  );

  const renderHeader = () => (
    <View
      style={[
        styles.hero,
        {
          backgroundColor: theme.contactsBanner,
          borderColor: theme.border,
        },
      ]}
    >
      <View style={[styles.heroIconWrap, { backgroundColor: theme.contactsMuted }]}>
        <Ionicons name="map" size={22} color={theme.contactsAccent} />
      </View>
      <AppText variant="title" style={[styles.heroTitle, { color: theme.text }]}>
        Saved locations
      </AppText>
      <AppText muted variant="caption" style={styles.heroSub}>
        Meeting points, evacuation spots, or shelters — for quick reference when plans name them.
      </AppText>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.contactsMuted }]}>
        <Ionicons name="location-outline" size={28} color={theme.contactsAccent} />
      </View>
      <AppText variant="subtitle" style={{ color: theme.text, textAlign: 'center', marginTop: spacing.md }}>
        No saved locations yet
      </AppText>
      <AppText muted variant="caption" style={{ textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 }}>
        Add addresses you may need during an evacuation or reunion.
      </AppText>
    </View>
  );

  if (!ready || error) {
    return (
      <Screen back title="Saved locations">
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <AppText style={{ color: theme.text }}>{error ? 'Database error' : 'Loading…'}</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen back title="Saved locations">
      <View style={styles.root}>
        {loading ? (
          <ActivityIndicator color={theme.contactsAccent} style={{ marginTop: spacing.xxl }} />
        ) : (
          <FlatList
            data={locations}
            keyExtractor={(l) => String(l.id)}
            contentContainerStyle={styles.list}
            ListHeaderComponent={renderHeader}
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SavedLocationRow location={item} onOpen={() => router.push(`/contacts/locations/${item.id}`)} />
            )}
          />
        )}
        <View
          style={[
            styles.footer,
            { borderTopColor: theme.border, backgroundColor: theme.surfaceElevated },
            footerPad,
          ]}
        >
          <AppButton title="Add location" onPress={() => router.push('/contacts/locations/new')} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.sm,
    paddingBottom: scrollBottomInsetAboveFooter,
  },
  hero: {
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  heroIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  heroTitle: { marginBottom: spacing.xs },
  heroSub: { lineHeight: 18 },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
