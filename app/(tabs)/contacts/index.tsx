import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ContactRow } from '@/components/contacts/ContactRow';
import { AppButton } from '@/components/ui/AppButton';
import { Screen } from '@/components/ui/Screen';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { screenPadding, scrollBottomInsetAboveFooter } from '@/constants/layout';
import { radius, spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { useContacts } from '@/hooks/useContacts';
import { useTabBarFooterPadding } from '@/hooks/useTabBarFooterPadding';

export default function ContactsListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const { contacts, loading } = useContacts();
  const footerPad = useTabBarFooterPadding();

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
        <Ionicons name="people" size={30} color={theme.contactsAccent} />
      </View>
      <AppText variant="title" style={[styles.heroTitle, { color: theme.text }]}>
        Your contacts
      </AppText>
      <AppText muted variant="caption" style={styles.heroSub}>
        Add family and out-of-town contacts for fast call or SMS when it matters.
      </AppText>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: theme.contactsMuted }]}>
        <Ionicons name="person-add-outline" size={36} color={theme.contactsAccent} />
      </View>
      <AppText variant="subtitle" style={{ color: theme.text, textAlign: 'center', marginTop: spacing.md }}>
        No contacts yet
      </AppText>
      <AppText muted variant="caption" style={{ textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 }}>
        Add people you may need to reach quickly — family, emergency, or out-of-town.
      </AppText>
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
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <ContactRow contact={item} onOpen={() => router.push(`/contacts/${item.id}`)} />
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
          <AppButton title="Add contact" onPress={() => router.push('/contacts/add')} />
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
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  heroIconWrap: {
    width: 56,
    height: 56,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  heroTitle: { marginBottom: spacing.sm },
  heroSub: { lineHeight: 20 },
  empty: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
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
