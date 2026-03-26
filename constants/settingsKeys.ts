/** Persisted keys in `settings` table */
export const SETTING_KEYS = {
  SMS_DEFAULT_BODY: 'sms_default_body',
  EMERGENCY_HOLD_MS: 'emergency_hold_ms',
} as const;

export const DEFAULT_SMS_BODY = 'I am safe.';
export const DEFAULT_HOLD_MS = 700;
export const HOLD_MS_MIN = 300;
export const HOLD_MS_MAX = 5000;
