import { useCallback, useEffect, useState } from 'react';

import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';
import type { GuideRow, LibraryGroup } from '@/types';

export function useGuides(
  query?: string,
  bookmarkedOnly?: boolean,
  libraryGroup?: LibraryGroup | 'all'
) {
  const { db, ready } = useDatabase();
  const [guides, setGuides] = useState<GuideRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!db) return;
      if (!opts?.silent) setLoading(true);
      const rows = await Q.listGuides(db, query, bookmarkedOnly, libraryGroup);
      setGuides(rows);
      setLoading(false);
    },
    [db, query, bookmarkedOnly, libraryGroup]
  );

  useEffect(() => {
    if (ready && db) void refresh();
  }, [ready, db, refresh]);

  const setBookmarked = useCallback(
    async (id: number, bookmarked: boolean) => {
      if (!db) return;
      await Q.setGuideBookmarked(db, id, bookmarked);
      await refresh();
    },
    [db, refresh]
  );

  return { guides, loading, refresh, setBookmarked };
}
