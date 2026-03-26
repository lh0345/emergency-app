import { useCallback, useEffect, useState } from 'react';

import { useDatabase } from '@/db/context';
import { getPlanTemplates } from '@/db/seed';
import * as Q from '@/db/queries';
import type { PlanRow } from '@/types';

export function usePlans() {
  const { db, ready } = useDatabase();
  const [plans, setPlans] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!db) return;
      if (!opts?.silent) setLoading(true);
      const rows = await Q.listPlans(db);
      setPlans(rows);
      setLoading(false);
    },
    [db]
  );

  useEffect(() => {
    if (ready && db) void refresh();
  }, [ready, db, refresh]);

  const addPlan = useCallback(
    async (input: {
      title: string;
      type: string;
      summary: string;
      householdProfileId?: number | null;
      suppliesNeededJson?: string;
      contactIdsJson?: string;
      planNotes?: string;
      reviewDate?: string | null;
    }) => {
      if (!db) return;
      await Q.insertPlan(db, input);
      await refresh();
    },
    [db, refresh]
  );

  const addPlanFromTemplate = useCallback(
    async (templateIndex: number) => {
      if (!db) return;
      const templates = getPlanTemplates();
      const t = templates[templateIndex];
      if (!t) return;
      await Q.insertPlanWithChecklist(db, {
        title: t.title,
        type: t.type,
        summary: t.summary,
        checklist: t.checklist,
        suppliesNeededJson: JSON.stringify(t.suppliesNeeded),
        planNotes: t.planNotes,
      });
      await refresh();
    },
    [db, refresh]
  );

  const updatePlan = useCallback(
    async (
      id: number,
      input: Partial<{
        title: string;
        type: string;
        summary: string;
        householdProfileId: number | null;
        suppliesNeededJson: string;
        contactIdsJson: string;
        planNotes: string;
        reviewDate: string | null;
      }>
    ) => {
      if (!db) return;
      await Q.updatePlan(db, id, input);
      await refresh();
    },
    [db, refresh]
  );

  const removePlan = useCallback(
    async (id: number) => {
      if (!db) return;
      await Q.deletePlan(db, id);
      await refresh();
    },
    [db, refresh]
  );

  const duplicatePlan = useCallback(
    async (id: number) => {
      if (!db) return;
      await Q.duplicatePlan(db, id);
      await refresh();
    },
    [db, refresh]
  );

  return { plans, loading, refresh, addPlan, addPlanFromTemplate, updatePlan, removePlan, duplicatePlan };
}
