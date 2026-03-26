export const SCHEMA_VERSION = 2;

export const MIGRATIONS: Record<number, string[]> = {
  1: [
    `CREATE TABLE IF NOT EXISTS supplies (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity REAL NOT NULL DEFAULT 0,
      unit TEXT NOT NULL DEFAULT '',
      expiryDate TEXT,
      location TEXT,
      notes TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`,
    `CREATE INDEX IF NOT EXISTS idx_supplies_category ON supplies(category);`,
    `CREATE INDEX IF NOT EXISTS idx_supplies_expiry ON supplies(expiryDate);`,
    `CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'other',
      notes TEXT,
      meetingLocation TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS plans (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );`,
    `CREATE TABLE IF NOT EXISTS checklist_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      contextType TEXT NOT NULL,
      contextId TEXT NOT NULL,
      text TEXT NOT NULL,
      done INTEGER NOT NULL DEFAULT 0,
      orderIndex INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE INDEX IF NOT EXISTS idx_checklist_context ON checklist_items(contextType, contextId);`,
    `CREATE TABLE IF NOT EXISTS guides (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      title TEXT NOT NULL,
      category TEXT NOT NULL,
      overview TEXT NOT NULL,
      stepsJson TEXT NOT NULL,
      suppliesJson TEXT NOT NULL,
      mistakesJson TEXT NOT NULL,
      safetyNote TEXT NOT NULL,
      bookmarked INTEGER NOT NULL DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS saved_locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'other'
    );`,
    `CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL
    );`,
  ],
  2: [
    `ALTER TABLE supplies ADD COLUMN subcategory TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE supplies ADD COLUMN dailyUse REAL NOT NULL DEFAULT 0;`,
    `ALTER TABLE supplies ADD COLUMN targetAmount REAL NOT NULL DEFAULT 0;`,
    `ALTER TABLE supplies ADD COLUMN restockPriority TEXT NOT NULL DEFAULT 'normal';`,
    `ALTER TABLE guides ADD COLUMN slug TEXT;`,
    `ALTER TABLE guides ADD COLUMN tagsJson TEXT NOT NULL DEFAULT '[]';`,
    `ALTER TABLE guides ADD COLUMN readingTime INTEGER NOT NULL DEFAULT 5;`,
    `ALTER TABLE guides ADD COLUMN offlineReady INTEGER NOT NULL DEFAULT 1;`,
    `ALTER TABLE guides ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;`,
    `ALTER TABLE guides ADD COLUMN relatedTopicsJson TEXT NOT NULL DEFAULT '[]';`,
    `ALTER TABLE guides ADD COLUMN libraryGroup TEXT NOT NULL DEFAULT 'emergency';`,
    `CREATE UNIQUE INDEX IF NOT EXISTS idx_guides_slug ON guides(slug) WHERE slug IS NOT NULL;`,
    `ALTER TABLE plans ADD COLUMN householdProfileId INTEGER;`,
    `ALTER TABLE plans ADD COLUMN suppliesNeededJson TEXT NOT NULL DEFAULT '[]';`,
    `ALTER TABLE plans ADD COLUMN contactIdsJson TEXT NOT NULL DEFAULT '[]';`,
    `ALTER TABLE plans ADD COLUMN planNotes TEXT NOT NULL DEFAULT '';`,
    `ALTER TABLE plans ADD COLUMN reviewDate TEXT;`,
    `CREATE TABLE IF NOT EXISTS household_profile (
      id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      peopleCount INTEGER NOT NULL DEFAULT 1,
      adults INTEGER NOT NULL DEFAULT 1,
      children INTEGER NOT NULL DEFAULT 0,
      dietaryNotes TEXT NOT NULL DEFAULT '',
      medicineNotes TEXT NOT NULL DEFAULT '',
      waterUsePerDay REAL NOT NULL DEFAULT 2,
      foodUsePerDay REAL NOT NULL DEFAULT 2000,
      heatingType TEXT NOT NULL DEFAULT '',
      cookingType TEXT NOT NULL DEFAULT '',
      vehicleFuelAccess TEXT NOT NULL DEFAULT '',
      updatedAt TEXT NOT NULL
    );`,
  ],
};
