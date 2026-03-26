import { useCallback, useEffect, useState } from 'react';

import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import type { SupplyCategory, SupplyRow } from '@/types';

export function useSupplies() {
  const { db, ready } = useDatabase();
  const [supplies, setSupplies] = useState<SupplyRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!db) return;
    setLoading(true);
    const rows = await Q.listSupplies(db);
    setSupplies(rows);
    setLoading(false);
  }, [db]);

  useEffect(() => {
    if (ready && db) void refresh();
  }, [ready, db, refresh]);

  const addSupply = useCallback(
    async (input: {
      name: string;
      category: SupplyCategory;
      quantity: number;
      unit: string;
      expiryDate: string | null;
      location: string | null;
      notes: string | null;
    }) => {
      if (!db) return;
      await Q.insertSupply(db, input);
      await refresh();
    },
    [db, refresh]
  );

  const updateSupply = useCallback(
    async (id: number, input: Parameters<typeof Q.updateSupply>[2]) => {
      if (!db) return;
      await Q.updateSupply(db, id, input);
      await refresh();
    },
    [db, refresh]
  );

  const removeSupply = useCallback(
    async (id: number) => {
      if (!db) return;
      await Q.deleteSupply(db, id);
      await refresh();
    },
    [db, refresh]
  );

  return { supplies, loading, refresh, addSupply, updateSupply, removeSupply };
}
