import React, { createContext, useContext, useEffect, useState } from 'react';
import type * as SQLite from 'expo-sqlite';

import { openDb } from '@/db/db';
import { seedIfEmpty } from '@/db/queries';

type DbContextValue = {
  db: SQLite.SQLiteDatabase | null;
  ready: boolean;
  error: Error | null;
};

const DbContext = createContext<DbContextValue>({
  db: null,
  ready: false,
  error: null,
});

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const instance = await openDb();
        await seedIfEmpty(instance);
        if (!cancelled) {
          setDb(instance);
          setReady(true);
        }
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)));
          setReady(true);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <DbContext.Provider value={{ db, ready, error }}>{children}</DbContext.Provider>
  );
}

export function useDatabase() {
  return useContext(DbContext);
}
