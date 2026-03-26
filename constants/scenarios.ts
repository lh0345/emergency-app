import type { LibraryGroup, SupplyCategory } from '@/types';

export type ScenarioCategory = 'emergency' | 'shortage' | 'disruption' | 'safety';

export type ScenarioQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
};

export type ScenarioDefinition = {
  id: string;
  title: string;
  shortLabel: string;
  category: ScenarioCategory;
  questions: ScenarioQuestion[];
  /** Default top actions if no branching */
  defaultActions: string[];
  /** Extra lines appended on the emergency checklist (after top 3). */
  extendedChecklistItems?: string[];
  /** Library guide slugs — see `db/seed.ts`. */
  relatedGuideSlugs?: string[];
  /** Hints for which supply groups matter most. */
  relatedSupplyCategories?: SupplyCategory[];
  /** Matches Library group for UI badges. */
  libraryGroup?: LibraryGroup;
};

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'power_outage',
    title: 'Power outage',
    shortLabel: 'Power',
    category: 'emergency',
    questions: [
      {
        id: 'duration',
        prompt: 'How long might power be out?',
        options: [
          { id: 'short', label: 'Under a few hours' },
          { id: 'long', label: 'Unknown / could be long' },
        ],
      },
      {
        id: 'heat',
        prompt: 'Is it very hot or cold where you are?',
        options: [
          { id: 'mild', label: 'Comfortable' },
          { id: 'extreme', label: 'Very hot or very cold' },
        ],
      },
    ],
    defaultActions: [
      'Charge phones and power banks now',
      'Turn off sensitive electronics at the breaker if safe',
      'Use flashlights — avoid open flames indoors',
    ],
    extendedChecklistItems: ['Note fridge/freezer times; eat perishables first when safe'],
    relatedGuideSlugs: ['power-first-10', 'long-power-loss'],
    relatedSupplyCategories: ['Power', 'Food', 'Water'],
    libraryGroup: 'emergency',
  },
  {
    id: 'long_power_loss',
    title: 'Long-term power loss',
    shortLabel: 'Long power',
    category: 'emergency',
    questions: [
      {
        id: 'heat',
        prompt: 'Is heating or cooling a concern?',
        options: [
          { id: 'yes', label: 'Yes — extreme temps' },
          { id: 'no', label: 'Mild weather' },
        ],
      },
    ],
    defaultActions: [
      'Keep fridge/freezer closed; eat perishable food first when safe',
      'Preserve phone battery — short check-ins only',
      'Never use outdoor stoves, grills, or generators indoors',
    ],
    extendedChecklistItems: ['Rotate battery radio / NOAA checks', 'Check neighbors at risk from heat or cold'],
    relatedGuideSlugs: ['long-power-loss', 'cooking-without-power'],
    relatedSupplyCategories: ['Power', 'Food', 'Home resilience'],
    libraryGroup: 'emergency',
  },
  {
    id: 'water_outage',
    title: 'Water outage',
    shortLabel: 'Water',
    category: 'emergency',
    questions: [
      {
        id: 'drink',
        prompt: 'Do you have bottled or stored drinking water?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No / not sure' },
        ],
      },
    ],
    defaultActions: [
      'Fill clean containers with tap water if still running',
      'Avoid using unknown outdoor water for drinking',
      'Reduce water use for flushing if supply is limited',
    ],
    relatedGuideSlugs: ['water-drinking-safety'],
    relatedSupplyCategories: ['Water', 'Home resilience'],
    libraryGroup: 'emergency',
  },
  {
    id: 'water_contamination',
    title: 'Water contamination',
    shortLabel: 'Bad water',
    category: 'safety',
    questions: [
      {
        id: 'boil',
        prompt: 'Did officials issue a boil-water or do-not-use notice?',
        options: [
          { id: 'yes', label: 'Yes / suspected' },
          { id: 'no', label: 'Not sure yet' },
        ],
      },
    ],
    defaultActions: [
      'Switch to sealed bottled water for drinking and brushing teeth',
      'Follow official boil or do-not-use instructions exactly',
      'Conserve bottled supply — wipe surfaces before rinsing',
    ],
    extendedChecklistItems: ['Label unsafe taps for household', 'Use hand sanitizer when tap water is suspect'],
    relatedGuideSlugs: ['water-contamination', 'sanitation-basics'],
    relatedSupplyCategories: ['Water', 'Medicine'],
    libraryGroup: 'emergency',
  },
  {
    id: 'evacuation',
    title: 'Evacuation',
    shortLabel: 'Evacuate',
    category: 'emergency',
    questions: [
      {
        id: 'route',
        prompt: 'Do you already know your route and meeting point?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No — need to decide' },
        ],
      },
    ],
    defaultActions: [
      'Pack go-bag: water, meds, documents, charger',
      'Follow official evacuation routes if ordered',
      'Text a contact with your destination when safe',
    ],
    relatedGuideSlugs: ['evacuation-go-bag'],
    relatedSupplyCategories: ['Food', 'Medicine', 'Power'],
    libraryGroup: 'emergency',
  },
  {
    id: 'shelter_in_place',
    title: 'Shelter in place',
    shortLabel: 'Shelter',
    category: 'safety',
    questions: [
      {
        id: 'room',
        prompt: 'Do you have an interior room with few windows?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No / not sure' },
        ],
      },
    ],
    defaultActions: [
      'Move to smallest interior room; bring radio and phone',
      'Close windows; turn off HVAC if advised for airborne hazards',
      'Seal doors with plastic and tape only if official guidance says to',
    ],
    relatedGuideSlugs: ['shelter-in-place', 'sanitation-basics'],
    relatedSupplyCategories: ['Water', 'Home resilience', 'Power'],
    libraryGroup: 'emergency',
  },
  {
    id: 'medical_emergency',
    title: 'Medical emergency',
    shortLabel: 'Medical',
    category: 'emergency',
    questions: [
      {
        id: 'conscious',
        prompt: 'Is the person awake and breathing normally?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No / unsure' },
        ],
      },
    ],
    defaultActions: [
      'If life-threatening, call emergency services',
      'Do not move someone with severe injury unless immediate danger',
      'Gather medication list and allergies if available',
    ],
    relatedGuideSlugs: ['first-aid-essentials'],
    relatedSupplyCategories: ['Medicine'],
    libraryGroup: 'emergency',
  },
  {
    id: 'medicine_shortage',
    title: 'Medicine shortage',
    shortLabel: 'Meds',
    category: 'shortage',
    questions: [
      {
        id: 'rx',
        prompt: 'Are prescriptions current for the next 2 weeks?',
        options: [
          { id: 'ok', label: 'Yes / mostly' },
          { id: 'low', label: 'No / running low' },
        ],
      },
    ],
    defaultActions: [
      'Call pharmacy or clinician about early refills where appropriate',
      'Prioritize chronic meds over optional items',
      'Keep a written list of doses and allergies with your kit',
    ],
    extendedChecklistItems: ['Split supplies sensibly within household; do not skip prescribed doses without advice'],
    relatedGuideSlugs: ['first-aid-essentials'],
    relatedSupplyCategories: ['Medicine'],
    libraryGroup: 'emergency',
  },
  {
    id: 'fire',
    title: 'Fire',
    shortLabel: 'Fire',
    category: 'emergency',
    questions: [
      {
        id: 'inside',
        prompt: 'Are you inside the building?',
        options: [
          { id: 'inside', label: 'Yes' },
          { id: 'outside', label: 'Already outside' },
        ],
      },
    ],
    defaultActions: [
      'Leave immediately — do not stop for belongings',
      'Stay low if smoke; test doors before opening',
      'Meet at your planned outside meeting point',
    ],
    relatedGuideSlugs: ['evacuation-go-bag'],
    relatedSupplyCategories: ['Home resilience'],
    libraryGroup: 'emergency',
  },
  {
    id: 'severe_weather',
    title: 'Severe weather',
    shortLabel: 'Weather',
    category: 'emergency',
    questions: [
      {
        id: 'shelter',
        prompt: 'Do you have a safe room or basement?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No' },
        ],
      },
    ],
    defaultActions: [
      'Move to smallest interior room on lowest floor',
      'Stay away from windows and exterior doors',
      'Keep a battery radio or phone alerts on',
    ],
    relatedGuideSlugs: ['severe-weather-room'],
    relatedSupplyCategories: ['Home resilience', 'Power'],
    libraryGroup: 'emergency',
  },
  {
    id: 'no_communication',
    title: 'Communication blackout',
    shortLabel: 'Comms',
    category: 'disruption',
    questions: [
      {
        id: 'sms',
        prompt: 'Can you send SMS when calls fail?',
        options: [
          { id: 'try', label: 'Will try SMS' },
          { id: 'offline', label: 'Phone shows no service' },
        ],
      },
    ],
    defaultActions: [
      'Try SMS — it often works when voice does not',
      'Conserve battery: airplane mode, short check-ins',
      'Use a preset check-in message when networks return',
    ],
    relatedGuideSlugs: ['communication-blackout'],
    relatedSupplyCategories: ['Power', 'Home resilience'],
    libraryGroup: 'emergency',
  },
  {
    id: 'food_shortage',
    title: 'Food shortage',
    shortLabel: 'Food',
    category: 'shortage',
    questions: [
      {
        id: 'pantry',
        prompt: 'Do you have shelf-stable staples for several days?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'Low / not sure' },
        ],
      },
    ],
    defaultActions: [
      'Inventory pantry and freezer; plan one simple meal pattern',
      'Stretch protein with rice, beans, or grains',
      'Reduce waste — smaller portions; use leftovers first',
    ],
    extendedChecklistItems: ['Check on neighbors with kids when you can'],
    relatedGuideSlugs: ['stocking-pantry', 'cooking-without-power'],
    relatedSupplyCategories: ['Food', 'Water'],
    libraryGroup: 'self_reliance',
  },
  {
    id: 'fuel_shortage',
    title: 'Fuel shortage',
    shortLabel: 'Fuel',
    category: 'shortage',
    questions: [
      {
        id: 'tank',
        prompt: 'Roughly how much fuel do you have for essential travel?',
        options: [
          { id: 'ok', label: 'Half tank or more' },
          { id: 'low', label: 'Low / almost empty' },
        ],
      },
    ],
    defaultActions: [
      'Combine trips; avoid idling',
      'Keep approved fuel containers stored safely',
      'Have a bike or walking plan for short critical trips',
    ],
    relatedGuideSlugs: ['off-grid-basics'],
    relatedSupplyCategories: ['Power', 'Home resilience'],
    libraryGroup: 'emergency',
  },
  {
    id: 'supply_chain_disruption',
    title: 'Supply chain disruption',
    shortLabel: 'Supplies',
    category: 'disruption',
    questions: [
      {
        id: 'stock',
        prompt: 'Are key staples (food, soap, meds) already at home?',
        options: [
          { id: 'yes', label: 'Mostly yes' },
          { id: 'no', label: 'Gaps / running low' },
        ],
      },
    ],
    defaultActions: [
      'Buy to a list — avoid panic hoarding perishables',
      'Substitute with shelf-stable options you will actually eat',
      'Rotate stock: oldest items first',
    ],
    relatedGuideSlugs: ['stocking-pantry', 'basic-repairs'],
    relatedSupplyCategories: ['Food', 'Home resilience', 'Medicine'],
    libraryGroup: 'self_reliance',
  },
  {
    id: 'inflation_pressure',
    title: 'Price spike / tight budget',
    shortLabel: 'Budget',
    category: 'shortage',
    questions: [
      {
        id: 'cash',
        prompt: 'Do you keep a small cash buffer at home?',
        options: [
          { id: 'yes', label: 'Yes' },
          { id: 'no', label: 'No / minimal' },
        ],
      },
    ],
    defaultActions: [
      'Prioritize rent, power, water, meds, then food',
      'Switch to simple staples; cut discretionary buys first',
      'Track prices you care about — buy on sale with a list',
    ],
    relatedGuideSlugs: ['cash-budget-shortage', 'stocking-pantry'],
    relatedSupplyCategories: ['Food', 'Home resilience'],
    libraryGroup: 'self_reliance',
  },
];

export function getScenarioById(id: string) {
  return SCENARIOS.find((s) => s.id === id);
}

export function pickActionsForScenario(
  scenarioId: string,
  answers: Record<string, string>
): string[] {
  const scenario = getScenarioById(scenarioId);
  if (!scenario) return [];

  if (scenarioId === 'power_outage' && answers.duration === 'long') {
    return [
      'Preserve phone battery: dim screen, limit use',
      'Keep fridge/freezer closed as much as possible',
      'Unplug sensitive devices to avoid surge when power returns',
    ];
  }
  if (scenarioId === 'water_outage' && answers.drink === 'no') {
    return [
      'Prioritize drinking water from sealed bottles first',
      'Locate community water distribution if announced',
      'Avoid strenuous activity to reduce water needs',
    ];
  }
  if (scenarioId === 'medical_emergency' && answers.conscious === 'no') {
    return [
      'Call emergency services immediately if not already done',
      'If trained, begin CPR only when appropriate to condition',
      'Clear airway hazards; do not give food or drink',
    ];
  }
  if (scenarioId === 'long_power_loss' && answers.heat === 'yes') {
    return [
      'Move sleep to the warmest or coolest interior room',
      'Never use outdoor heat or cooking devices indoors',
      'Check on heat-sensitive people frequently',
    ];
  }
  if (scenarioId === 'water_contamination' && answers.boil === 'yes') {
    return [
      'Use sealed bottled water until the notice is lifted',
      'Follow boil times exactly if boiling is required',
      'Do not brush teeth with suspect water',
    ];
  }
  if (scenarioId === 'shelter_in_place' && answers.room === 'no') {
    return [
      'Pick the most interior wall space away from windows',
      'Bring water, radio, and phone; seal doors only if advised',
      'Stay put until official all-clear',
    ];
  }
  if (scenarioId === 'medicine_shortage' && answers.rx === 'low') {
    return [
      'Contact clinician or pharmacy about supply options first',
      'Never ration prescribed meds without professional guidance',
      'Document what you take, dose, and allergies on paper',
    ];
  }
  if (scenarioId === 'food_shortage' && answers.pantry === 'no') {
    return [
      'Buy a small set of staples: grains, canned protein, oil, salt',
      'Cook one-pot meals to save fuel and time',
      'Drink water — avoid panic-buying drinks you do not need',
    ];
  }
  if (scenarioId === 'fuel_shortage' && answers.tank === 'low') {
    return [
      'Plan one combined errand; avoid topping off repeatedly',
      'Keep vehicle maintained — underinflated tires waste fuel',
      'Coordinate with neighbors for shared trips if safe',
    ];
  }
  if (scenarioId === 'supply_chain_disruption' && answers.stock === 'no') {
    return [
      'Fill gaps with longest-lasting staples first',
      'Buy extras only within budget — rotation beats hoarding',
      'Repair before replace when possible',
    ];
  }
  if (scenarioId === 'inflation_pressure' && answers.cash === 'no') {
    return [
      'Withdraw a small amount of small bills for card outages',
      'Pay fixed costs before discretionary spending',
      'Meal-plan from what you already have before shopping',
    ];
  }

  return scenario.defaultActions.slice(0, 3);
}

/** Full checklist lines for persistence (top actions + optional extras). */
export function pickChecklistLinesForScenario(
  scenarioId: string,
  answers: Record<string, string>
): string[] {
  const actions = pickActionsForScenario(scenarioId, answers);
  const scenario = getScenarioById(scenarioId);
  const extra = scenario?.extendedChecklistItems ?? [];
  return [...actions, ...extra].slice(0, 12);
}
