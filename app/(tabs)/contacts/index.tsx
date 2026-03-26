import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { ContactRow } from '@/components/contacts/ContactRow';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { getThemeColors } from '@/constants/Colors';
import { spacing } from '@/constants/spacing';
import { useColorScheme } from '@/components/useColorScheme';
import { useDatabase } from '@/db/context';
import { useContacts } from '@/hooks/useContacts';

export default function ContactsListScreen() {
  const scheme = useColorScheme() ?? 'light';
  const theme = getThemeColors(scheme === 'dark');
  const router = useRouter();
  const { ready, error } = useDatabase();
  const { contacts, loading } = useContacts();

  if (!ready || error) {
    return (
      <View style={[styles.center, { backgroundColor: theme.surface }]}>
        <AppText>{error ? 'DB error' : 'Loading…'}</AppText>
      </View>
    );
  }

  return (
    <View style={[styles.root, { backgroundColor: theme.surface }]}>
      {loading ? (
        <ActivityIndicator color={theme.accent} style={{ marginTop: spacing.lg }} />
      ) : (
        <FlatList
          data={contacts}
          keyExtractor={(c) => String(c.id)}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <AppText muted style={{ marginTop: spacing.lg }}>
              Add family and out-of-town contacts for fast call or SMS.
            </AppText>
          }
          renderItem={({ item }) => (
            <ContactRow contact={item} onOpen={() => router.push(`/contacts/${item.id}`)} />
          )}
        />
      )}
      <View style={styles.footer}>
        <AppButton title="Add contact" onPress={() => router.push('/contacts/add')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: spacing.lg, paddingBottom: 120 },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#33415555',
  },
});
