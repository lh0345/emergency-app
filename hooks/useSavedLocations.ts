import { useCallback, useEffect, useState } from 'react';

import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import type { SavedLocationRow, SavedLocationType } from '@/types';

export function useSavedLocations() {
  const { db, ready } = useDatabase();
  const [locations, setLocations] = useState<SavedLocationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!db) return;
      if (!opts?.silent) setLoading(true);
      const rows = await Q.listSavedLocations(db);
      setLocations(rows);
      setLoading(false);
    },
    [db]
  );

  useEffect(() => {
    if (ready && db) void refresh();
  }, [ready, db, refresh]);

  const addLocation = useCallback(
    async (input: { name: string; address: string; type: SavedLocationType }) => {
      if (!db) return;
      await Q.insertSavedLocation(db, input);
      await refresh();
    },
    [db, refresh]
  );

  const updateLocation = useCallback(
    async (id: number, input: Parameters<typeof Q.updateSavedLocation>[2]) => {
      if (!db) return;
      await Q.updateSavedLocation(db, id, input);
      await refresh();
    },
    [db, refresh]
  );

  const removeLocation = useCallback(
    async (id: number) => {
      if (!db) return;
      await Q.deleteSavedLocation(db, id);
      await refresh();
    },
    [db, refresh]
  );

  return { locations, loading, refresh, addLocation, updateLocation, removeLocation };
}
