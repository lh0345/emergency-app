import { calculateDaysLeft } from '@/utils/calculateDaysLeft';
import type { HouseholdProfileRow, SupplyCategory, SupplyRow } from '@/types';

export type RiskLevel = 'low' | 'moderate' | 'elevated';

function isWater(s: SupplyRow) {
  return s.category === 'Water';
}
function isFood(s: SupplyRow) {
  return s.category === 'Food';
}
function isPower(s: SupplyRow) {
  return s.category === 'Power';
}
function isMedicine(s: SupplyRow) {
  return s.category === 'Medicine';
}

/** Estimated days of water coverage when items track usage, or a rough fallback. */
export function estimateWaterDays(supplies: SupplyRow[], profile: HouseholdProfileRow): number | null {
  const water = supplies.filter(isWater);
  if (water.length === 0) return null;
  let fromUsage = 0;
  let hasUsage = false;
  for (const w of water) {
    if (w.dailyUse > 0) {
      fromUsage += w.quantity / w.dailyUse;
      hasUsage = true;
    }
  }
  if (hasUsage) return Math.round(fromUsage * 10) / 10;
  const total = water.reduce((a, x) => a + x.quantity, 0);
  const need = Math.max(profile.waterUsePerDay, 0.1) * Math.max(profile.peopleCount, 1);
  return Math.round((total / need) * 10) / 10;
}

/** Estimated food coverage using per-item daily use or household calorie proxy. */
export function estimateFoodDays(supplies: SupplyRow[], profile: HouseholdProfileRow): number | null {
  const food = supplies.filter(isFood);
  if (food.length === 0) return null;
  let fromUsage = 0;
  let hasUsage = false;
  for (const f of food) {
    if (f.dailyUse > 0) {
      fromUsage += f.quantity / f.dailyUse;
      hasUsage = true;
    }
  }
  if (hasUsage) return Math.round(fromUsage * 10) / 10;
  return null;
}

/** 0–1 score: power items at or above target. */
export function powerReadinessScore(supplies: SupplyRow[]): number | null {
  const power = supplies.filter(isPower);
  if (power.length === 0) return null;
  let ok = 0;
  for (const p of power) {
    if (p.targetAmount > 0) {
      if (p.quantity >= p.targetAmount) ok += 1;
    } else if (p.quantity > 0) {
      ok += 1;
    }
  }
  return ok / power.length;
}

export function medicineAlertCount(supplies: SupplyRow[]): number {
  let n = 0;
  for (const m of supplies.filter(isMedicine)) {
    const d = calculateDaysLeft(m.expiryDate);
    if (d !== null && d <= 30) n += 1;
    if (m.restockPriority === 'urgent' && m.targetAmount > 0 && m.quantity < m.targetAmount) n += 1;
  }
  return n;
}

export function computeRiskLevel(
  waterDays: number | null,
  foodDays: number | null,
  medAlerts: number
): RiskLevel {
  if (medAlerts >= 2) return 'elevated';
  const wLow = waterDays !== null && waterDays < 3;
  const fLow = foodDays !== null && foodDays < 3;
  if (wLow || fLow) return 'elevated';
  const wMed = waterDays !== null && waterDays < 7;
  const fMed = foodDays !== null && foodDays < 7;
  if (wMed || fMed || medAlerts === 1) return 'moderate';
  return 'low';
}

export function nextRecommendedAction(
  supplies: SupplyRow[],
  profile: HouseholdProfileRow
): string {
  const wd = estimateWaterDays(supplies, profile);
  const fd = estimateFoodDays(supplies, profile);
  if (wd !== null && wd < 3) return 'Increase stored water or set daily use on water items for clearer tracking.';
  if (fd !== null && fd < 3) return 'Add shelf-stable food or log usage so food days reflect your household.';
  if (medicineAlertCount(supplies) > 0) return 'Review medicine expiry and restock urgent items.';
  const pr = powerReadinessScore(supplies);
  if (pr !== null && pr < 0.5) return 'Bring power backups (batteries, bank) up to your target levels.';
  if (!profile.peopleCount || profile.peopleCount < 1) return 'Complete your household profile for better estimates.';
  return 'Review your plans and library guides — you are in good shape.';
}

export function formatDaysLabel(days: number | null): string {
  if (days === null) return '—';
  if (!Number.isFinite(days)) return '—';
  return `${Math.round(days * 10) / 10} d`;
}

export function categoryShortfall(
  supplies: SupplyRow[],
  category: SupplyCategory
): number {
  return supplies.filter((s) => s.category === category && s.targetAmount > 0 && s.quantity < s.targetAmount)
    .length;
}
