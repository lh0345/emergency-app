import { useCallback, useEffect, useState } from 'react';

import {
  DEFAULT_HOLD_MS,
  DEFAULT_SMS_BODY,
  HOLD_MS_MAX,
  HOLD_MS_MIN,
  SETTING_KEYS,
} from '@/constants/settingsKeys';
import { useDatabase } from '@/db/context';
import * as Q from '@/db/queries';

function clampHoldMs(n: number) {
  return Math.min(HOLD_MS_MAX, Math.max(HOLD_MS_MIN, Math.round(n)));
}

export function useSettings() {
  const { db, ready } = useDatabase();
  const [smsDefaultBody, setSmsDefaultBody] = useState(DEFAULT_SMS_BODY);
  const [holdMs, setHoldMs] = useState(DEFAULT_HOLD_MS);

  const load = useCallback(async () => {
    if (!db) return;
    const body = await Q.getSetting(db, SETTING_KEYS.SMS_DEFAULT_BODY);
    const hold = await Q.getSetting(db, SETTING_KEYS.EMERGENCY_HOLD_MS);
    if (body != null && body.trim()) setSmsDefaultBody(body.trim());
    if (hold != null) {
      const n = parseInt(hold, 10);
      if (Number.isFinite(n)) setHoldMs(clampHoldMs(n));
    }
  }, [db]);

  useEffect(() => {
    if (ready && db) void load();
  }, [ready, db, load]);

  const saveSmsDefaultBody = async (value: string) => {
    if (!db) return;
    const v = value.trim() || DEFAULT_SMS_BODY;
    await Q.setSetting(db, SETTING_KEYS.SMS_DEFAULT_BODY, v);
    setSmsDefaultBody(v);
  };

  const saveHoldMs = async (value: number) => {
    if (!db) return;
    const v = clampHoldMs(value);
    await Q.setSetting(db, SETTING_KEYS.EMERGENCY_HOLD_MS, String(v));
    setHoldMs(v);
  };

  return { smsDefaultBody, holdMs, refresh: load, saveSmsDefaultBody, saveHoldMs };
}
