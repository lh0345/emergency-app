export type SupplyCategory =
  | 'Water'
  | 'Food'
  | 'Power'
  | 'Medicine'
  | 'Home resilience'
  | 'Food growing'
  | 'Other';

export type RestockPriority = 'low' | 'normal' | 'high' | 'urgent';

export type ContactType = 'emergency' | 'family' | 'out_of_town' | 'other';

export type ChecklistContextType = 'plan' | 'emergency';

export type LibraryGroup = 'emergency' | 'self_reliance';

export type SupplyRow = {
  id: number;
  name: string;
  category: SupplyCategory;
  subcategory: string;
  quantity: number;
  unit: string;
  expiryDate: string | null;
  location: string | null;
  notes: string | null;
  dailyUse: number;
  targetAmount: number;
  restockPriority: RestockPriority;
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
  householdProfileId: number | null;
  suppliesNeededJson: string;
  contactIdsJson: string;
  planNotes: string;
  reviewDate: string | null;
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
  slug: string | null;
  tagsJson: string;
  readingTime: number;
  offlineReady: number;
  priority: number;
  relatedTopicsJson: string;
  libraryGroup: LibraryGroup;
};

export type GuideStep = { title: string; detail?: string };

export type SavedLocationType = 'meeting' | 'evacuation' | 'shelter' | 'other';

export type SavedLocationRow = {
  id: number;
  name: string;
  address: string;
  type: SavedLocationType;
};

export type HouseholdProfileRow = {
  id: number;
  peopleCount: number;
  adults: number;
  children: number;
  dietaryNotes: string;
  medicineNotes: string;
  waterUsePerDay: number;
  foodUsePerDay: number;
  heatingType: string;
  cookingType: string;
  vehicleFuelAccess: string;
  updatedAt: string;
};
