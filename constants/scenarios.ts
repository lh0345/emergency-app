export type ScenarioQuestion = {
  id: string;
  prompt: string;
  options: { id: string; label: string }[];
};

export type ScenarioDefinition = {
  id: string;
  title: string;
  shortLabel: string;
  questions: ScenarioQuestion[];
  /** Default top actions if no branching */
  defaultActions: string[];
};

export const SCENARIOS: ScenarioDefinition[] = [
  {
    id: 'power_outage',
    title: 'Power outage',
    shortLabel: 'Power',
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
  },
  {
    id: 'water_outage',
    title: 'Water outage',
    shortLabel: 'Water',
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
  },
  {
    id: 'evacuation',
    title: 'Evacuation',
    shortLabel: 'Evacuate',
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
  },
  {
    id: 'medical_emergency',
    title: 'Medical emergency',
    shortLabel: 'Medical',
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
  },
  {
    id: 'fire',
    title: 'Fire',
    shortLabel: 'Fire',
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
  },
  {
    id: 'severe_weather',
    title: 'Severe weather',
    shortLabel: 'Weather',
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
  },
  {
    id: 'no_communication',
    title: 'No communication',
    shortLabel: 'Comms',
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

  return scenario.defaultActions.slice(0, 3);
}
