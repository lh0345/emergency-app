import { useCallback, useEffect, useState } from 'react';

import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import type { HouseholdProfileRow } from '@/types';

export function useHouseholdProfile() {
  const { db, ready } = useDatabase();
  const [profile, setProfile] = useState<HouseholdProfileRow | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    await Q.ensureDefaultHouseholdProfile(db);
    const row = await Q.getHouseholdProfile(db);
    setProfile(row);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    if (ready && db) void refresh();
  }, [ready, db, refresh]);

  const save = useCallback(
    async (input: Partial<Omit<HouseholdProfileRow, 'id' | 'updatedAt'>>) => {
      if (!db) return;
      await Q.saveHouseholdProfile(db, input);
      await refresh();
    },
    [db, refresh]
  );

  return { profile, loading, refresh, save };
}
