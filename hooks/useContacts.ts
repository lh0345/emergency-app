import { useCallback, useEffect, useState } from 'react';

import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import type { ContactRow } from '@/types';

export function useContacts() {
  const { db, ready } = useDatabase();
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    const rows = await Q.listContacts(db);
    setContacts(rows);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    if (ready && db) void refresh();
  }, [ready, db, refresh]);

  const addContact = useCallback(
    async (input: {
      name: string;
      phone: string;
      type: ContactRow['type'];
      notes: string | null;
      meetingLocation: string | null;
    }) => {
      if (!db) return;
      await Q.insertContact(db, input);
      await refresh();
    },
    [db, refresh]
  );

  const updateContact = useCallback(
    async (id: number, input: Parameters<typeof Q.updateContact>[2]) => {
      if (!db) return;
      await Q.updateContact(db, id, input);
      await refresh();
    },
    [db, refresh]
  );

  const removeContact = useCallback(
    async (id: number) => {
      if (!db) return;
      await Q.deleteContact(db, id);
      await refresh();
    },
    [db, refresh]
  );

  return { contacts, loading, refresh, addContact, updateContact, removeContact };
}
