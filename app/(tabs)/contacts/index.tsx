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
import { spacing } from '@/constants/spacing';
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
    <View style={styles.headerBlock}>
      <AppText variant="title" style={{ color: theme.text }}>
        People
      </AppText>
      <AppText muted variant="caption" style={styles.headerSub}>
        Who to call, household size for estimates, and meeting places.
      </AppText>
      <View style={styles.linkRow}>
        <Pressable onPress={() => router.push('/contacts/household')} accessibilityRole="link">
          <AppText style={{ color: theme.contactsAccent, fontSize: 14 }}>Household</AppText>
        </Pressable>
        <AppText style={{ color: theme.textMuted }}> · </AppText>
        <Pressable onPress={() => router.push('/contacts/locations')} accessibilityRole="link">
          <AppText style={{ color: theme.contactsAccent, fontSize: 14 }}>Locations</AppText>
        </Pressable>
        <AppText style={{ color: theme.textMuted }}> · </AppText>
        <Pressable onPress={() => router.push('/contacts/settings')} accessibilityRole="link">
          <AppText style={{ color: theme.contactsAccent, fontSize: 14 }}>Settings</AppText>
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
  headerBlock: { marginBottom: spacing.md },
  headerSub: { lineHeight: 18, marginTop: 2 },
  linkRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginTop: spacing.sm,
    gap: 4,
  },
});
