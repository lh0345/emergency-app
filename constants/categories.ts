import type { SupplyCategory } from '@/types';

export const SUPPLY_CATEGORIES: SupplyCategory[] = [
  'Water',
  'Food',
  'Power',
  'Medicine',
  'Home resilience',
  'Food growing',
  'Other',
];

/** Suggested sub-labels per top-level category (user picks one or types custom). */
export const SUBCATEGORY_HINTS: Record<SupplyCategory, string[]> = {
  Water: ['Containers', 'Filters', 'Purification tablets', 'Stored water'],
  Food: ['Pantry', 'Canned', 'Rice & beans', 'Infant food', 'Pet food'],
  Power: ['Batteries', 'Power banks', 'Solar charger', 'Candles', 'Fuel'],
  Medicine: ['Prescriptions', 'Pain relief', 'Bandages', 'Hygiene'],
  'Home resilience': ['Cash', 'Documents', 'Flashlight', 'Radio', 'Tools', 'Tape', 'Tarp'],
  'Food growing': ['Seeds', 'Soil', 'Pots', 'Fertilizer', 'Watering'],
  Other: [],
};
