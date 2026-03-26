export type SupplyCategory = 'Water' | 'Food' | 'Power' | 'Medicine' | 'Other';

export type ContactType = 'emergency' | 'family' | 'out_of_town' | 'other';

export type ChecklistContextType = 'plan' | 'emergency';

export type SupplyRow = {
  id: number;
  name: string;
  category: SupplyCategory;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  location: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactRow = {
  id: number;
  name: string;
  phone: string;
  type: ContactType;
  notes: string | null;
  meetingLocation: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PlanRow = {
  id: number;
  title: string;
  type: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
};

export type ChecklistItemRow = {
  id: number;
  contextType: ChecklistContextType;
  contextId: string;
  text: string;
  done: number;
  orderIndex: number;
};

export type GuideRow = {
  id: number;
  title: string;
  category: string;
  overview: string;
  stepsJson: string;
  suppliesJson: string;
  mistakesJson: string;
  safetyNote: string;
  bookmarked: number;
};

export type GuideStep = { title: string; detail?: string };
