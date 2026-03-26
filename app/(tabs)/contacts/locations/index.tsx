import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { SavedLocationRow } from '@/components/contacts/SavedLocationRow';
import { FabAdd } from '@/components/ui/FabAdd';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding, scrollBottomInsetAboveFooter } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { useSavedLocations } from '@/hooks/useSavedLocations';

export default function SavedLocationsListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const { locations, loading, refresh } = useSavedLocations();

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
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <SavedLocationRow location={item} onOpen={() => router.push(`/contacts/locations/${item.id}`)} />
            )}
          />
        )}
        <FabAdd
          color={theme.contactsAccent}
          accessibilityLabel="Add location"
          onPress={() => router.push('/contacts/locations/new')}
        />
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
});
