/** Days until expiry; negative if past. Null if no date. */
export function calculateDaysLeft(expiryIso: string | null | undefined): number | null {
  if (!expiryIso) return null;
  const end = new Date(expiryIso);
  if (Number.isNaN(end.getTime())) return null;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const ms = end.getTime() - start.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}
