import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ContactRow } from '@/components/contacts/ContactRow';
import { FabAdd } from '@/components/ui/FabAdd';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding, scrollBottomInsetAboveFooter } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { useContacts } from '@/hooks/useContacts';
import { useSettings } from '@/hooks/useSettings';

export default function ContactsListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const { contacts, loading, refresh } = useContacts();
  const { smsDefaultBody } = useSettings();

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
        <Ionicons name="people" size={22} color={theme.contactsAccent} />
      </View>
      <AppText variant="title" style={[styles.heroTitle, { color: theme.text }]}>
        Your contacts
      </AppText>
      <AppText muted variant="caption" style={styles.heroSub}>
        Add family and out-of-town contacts for fast call or SMS when it matters.
      </AppText>
      <View style={styles.heroLinks}>
        <Pressable onPress={() => router.push('/contacts/household')} accessibilityRole="link">
          <AppText style={{ color: theme.contactsAccent, fontWeight: '600' }}>Household profile</AppText>
        </Pressable>
        <AppText style={{ color: theme.textMuted }}> · </AppText>
        <Pressable onPress={() => router.push('/contacts/locations')} accessibilityRole="link">
          <AppText style={{ color: theme.contactsAccent, fontWeight: '600' }}>Saved locations</AppText>
        </Pressable>
        <AppText style={{ color: theme.textMuted }}> · </AppText>
        <Pressable onPress={() => router.push('/contacts/settings')} accessibilityRole="link">
          <AppText style={{ color: theme.contactsAccent, fontWeight: '600' }}>App settings</AppText>
        </Pressable>
      </View>
    </View>
  );

  if (!ready || error) {
    return (
      <Screen>
        <View style={[styles.center, { backgroundColor: theme.surface }]}>
          <AppText style={{ color: theme.text }}>{error ? 'Database error' : 'Loading…'}</AppText>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.root}>
        {loading ? (
          <ActivityIndicator color={theme.contactsAccent} style={{ marginTop: spacing.xxl }} />
        ) : (
          <FlatList
            data={contacts}
            keyExtractor={(c) => String(c.id)}
            contentContainerStyle={styles.list}
            ListHeaderComponent={renderHeader}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ContactRow
                contact={item}
                smsDefaultBody={smsDefaultBody}
                onOpen={() => router.push(`/contacts/${item.id}`)}
              />
            )}
          />
        )}
        <FabAdd
          color={theme.contactsAccent}
          accessibilityLabel="Add contact"
          onPress={() => router.push('/contacts/add')}
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
  heroLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
});
