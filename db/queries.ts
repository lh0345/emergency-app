import type * as SQLite from 'expo-sqlite';

import {
  getDefaultSupplies,
  getPlanTemplates,
  getSeedGuides,
  type SeedGuide,
} from '@/db/seed';
import type {
  ChecklistContextType,
  ChecklistItemRow,
  ContactRow,
  GuideRow,
  HouseholdProfileRow,
  LibraryGroup,
  PlanRow,
  RestockPriority,
  SavedLocationRow,
  SavedLocationType,
  SupplyCategory,
  SupplyRow,
} from '@/types';

const CONTENT_PACK_KEY = 'content_pack_version';

function nowIso() {
  return new Date().toISOString();
}

function normalizeSupplyRow(r: SupplyRow): SupplyRow {
  return {
    ...r,
    subcategory: r.subcategory ?? '',
    dailyUse: r.dailyUse ?? 0,
    targetAmount: r.targetAmount ?? 0,
    restockPriority: (r.restockPriority as RestockPriority) ?? 'normal',
  };
}

function normalizePlanRow(r: PlanRow): PlanRow {
  return {
    ...r,
    householdProfileId: r.householdProfileId ?? null,
    suppliesNeededJson: r.suppliesNeededJson ?? '[]',
    contactIdsJson: r.contactIdsJson ?? '[]',
    planNotes: r.planNotes ?? '',
    reviewDate: r.reviewDate ?? null,
  };
}

function normalizeGuideRow(r: GuideRow): GuideRow {
  return {
    ...r,
    slug: r.slug ?? null,
    tagsJson: r.tagsJson ?? '[]',
    readingTime: r.readingTime ?? 5,
    offlineReady: r.offlineReady ?? 1,
    priority: r.priority ?? 0,
    relatedTopicsJson: r.relatedTopicsJson ?? '[]',
    libraryGroup: (r.libraryGroup as LibraryGroup) ?? 'emergency',
  };
}

async function upsertGuideFromSeed(db: SQLite.SQLiteDatabase, g: SeedGuide) {
  const stepsJson = JSON.stringify(g.steps);
  const suppliesJson = JSON.stringify(g.supplies);
  const mistakesJson = JSON.stringify(g.mistakes);
  const tagsJson = JSON.stringify(g.tags);
  const relatedJson = JSON.stringify(g.relatedTopics);
  const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM guides WHERE slug = ?', [
    g.slug,
  ]);
  if (existing) {
    await db.runAsync(
      `UPDATE guides SET
        title = ?, category = ?, overview = ?, stepsJson = ?, suppliesJson = ?, mistakesJson = ?, safetyNote = ?,
        tagsJson = ?, readingTime = ?, offlineReady = ?, priority = ?, relatedTopicsJson = ?, libraryGroup = ?
       WHERE slug = ?`,
      [
        g.title,
        g.category,
        g.overview,
        stepsJson,
        suppliesJson,
        mistakesJson,
        g.safetyNote,
        tagsJson,
        g.readingTime,
        g.offlineReady,
        g.priority,
        relatedJson,
        g.libraryGroup,
        g.slug,
      ]
    );
  } else {
    await db.runAsync(
      `INSERT INTO guides (
        slug, title, category, overview, stepsJson, suppliesJson, mistakesJson, safetyNote, bookmarked,
        tagsJson, readingTime, offlineReady, priority, relatedTopicsJson, libraryGroup
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?, ?)`,
      [
        g.slug,
        g.title,
        g.category,
        g.overview,
        stepsJson,
        suppliesJson,
        mistakesJson,
        g.safetyNote,
        tagsJson,
        g.readingTime,
        g.offlineReady,
        g.priority,
        relatedJson,
        g.libraryGroup,
      ]
    );
  }
}

async function seedDefaultSuppliesIfEmpty(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM supplies');
  if (row && row.c > 0) return;
  const t = nowIso();
  for (const s of getDefaultSupplies()) {
    await db.runAsync(
      `INSERT INTO supplies (
        name, category, subcategory, quantity, unit, expiryDate, location, notes,
        dailyUse, targetAmount, restockPriority, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, NULL, NULL, ?, ?, ?, ?, ?, ?)`,
      [
        s.name,
        s.category,
        s.subcategory,
        s.quantity,
        s.unit,
        s.notes,
        s.dailyUse,
        s.targetAmount,
        s.restockPriority,
        t,
        t,
      ]
    );
  }
}

async function seedPlanTemplatesIfEmpty(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM plans');
  if (row && row.c > 0) return;
  const templates = getPlanTemplates();
  const t = nowIso();
  for (const p of templates) {
    const res = await db.runAsync(
      `INSERT INTO plans (
        title, type, summary, createdAt, updatedAt,
        householdProfileId, suppliesNeededJson, contactIdsJson, planNotes, reviewDate
      ) VALUES (?, ?, ?, ?, ?, NULL, ?, '[]', ?, NULL)`,
      [
        p.title,
        p.type,
        p.summary,
        t,
        t,
        JSON.stringify(p.suppliesNeeded),
        p.planNotes,
      ]
    );
    const planId = Number(res.lastInsertRowId);
    let order = 0;
    for (const line of p.checklist) {
      await db.runAsync(
        `INSERT INTO checklist_items (contextType, contextId, text, done, orderIndex) VALUES (?, ?, ?, 0, ?)`,
        ['plan', String(planId), line, order++]
      );
    }
  }
}

export async function ensureDefaultHouseholdProfile(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM household_profile');
  if (row && row.c > 0) return;
  const t = nowIso();
  await db.runAsync(
    `INSERT INTO household_profile (
      peopleCount, adults, children, dietaryNotes, medicineNotes,
      waterUsePerDay, foodUsePerDay, heatingType, cookingType, vehicleFuelAccess, updatedAt
    ) VALUES (1, 1, 0, '', '', 2, 2000, '', '', '', ?)`,
    [t]
  );
}

async function seedFullDatabase(db: SQLite.SQLiteDatabase) {
  for (const g of getSeedGuides()) {
    await upsertGuideFromSeed(db, g);
  }
  await seedDefaultSuppliesIfEmpty(db);
  await ensureDefaultHouseholdProfile(db);
  await seedPlanTemplatesIfEmpty(db);
}

/** Upserts guides/plan templates for installs that already had the small v1 guide set. */
export async function ensureContentPack(db: SQLite.SQLiteDatabase) {
  const ver = await getSetting(db, CONTENT_PACK_KEY);
  if (ver === '2') return;
  for (const g of getSeedGuides()) {
    await upsertGuideFromSeed(db, g);
  }
  await seedPlanTemplatesIfEmpty(db);
  await seedDefaultSuppliesIfEmpty(db);
  await ensureDefaultHouseholdProfile(db);
  await setSetting(db, CONTENT_PACK_KEY, '2');
}

export async function seedIfEmpty(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM guides');
  if (!row || row.c === 0) {
    await seedFullDatabase(db);
  }
  await ensureContentPack(db);
}

// --- Supplies ---

export async function listSupplies(db: SQLite.SQLiteDatabase): Promise<SupplyRow[]> {
  const rows = await db.getAllAsync<SupplyRow>(
    'SELECT * FROM supplies ORDER BY category ASC, name ASC'
  );
  return rows.map(normalizeSupplyRow);
}

export async function insertSupply(
  db: SQLite.SQLiteDatabase,
  input: {
    name: string;
    category: SupplyCategory;
    subcategory?: string;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    location: string | null;
    notes: string | null;
    dailyUse?: number;
    targetAmount?: number;
    restockPriority?: RestockPriority;
  }
): Promise<number> {
  const t = nowIso();
  const res = await db.runAsync(
    `INSERT INTO supplies (
      name, category, subcategory, quantity, unit, expiryDate, location, notes,
      dailyUse, targetAmount, restockPriority, createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.category,
      input.subcategory ?? '',
      input.quantity,
      input.unit,
      input.expiryDate,
      input.location,
      input.notes,
      input.dailyUse ?? 0,
      input.targetAmount ?? 0,
      input.restockPriority ?? 'normal',
      t,
      t,
    ]
  );
  return Number(res.lastInsertRowId);
}

export async function updateSupply(
  db: SQLite.SQLiteDatabase,
  id: number,
  input: Partial<{
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
  }>
) {
  const row = await db.getFirstAsync<SupplyRow>('SELECT * FROM supplies WHERE id = ?', [id]);
  if (!row) return;
  const r = normalizeSupplyRow(row);
  const t = nowIso();
  await db.runAsync(
    `UPDATE supplies SET
      name = ?, category = ?, subcategory = ?, quantity = ?, unit = ?, expiryDate = ?, location = ?, notes = ?,
      dailyUse = ?, targetAmount = ?, restockPriority = ?, updatedAt = ?
     WHERE id = ?`,
    [
      input.name ?? r.name,
      input.category ?? r.category,
      input.subcategory ?? r.subcategory,
      input.quantity ?? r.quantity,
      input.unit ?? r.unit,
      input.expiryDate !== undefined ? input.expiryDate : r.expiryDate,
      input.location !== undefined ? input.location : r.location,
      input.notes !== undefined ? input.notes : r.notes,
      input.dailyUse !== undefined ? input.dailyUse : r.dailyUse,
      input.targetAmount !== undefined ? input.targetAmount : r.targetAmount,
      input.restockPriority ?? r.restockPriority,
      t,
      id,
    ]
  );
}

export async function deleteSupply(db: SQLite.SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM supplies WHERE id = ?', [id]);
}

export async function getSupply(db: SQLite.SQLiteDatabase, id: number): Promise<SupplyRow | null> {
  const row = await db.getFirstAsync<SupplyRow>('SELECT * FROM supplies WHERE id = ?', [id]);
  return row ? normalizeSupplyRow(row) : null;
}

// --- Contacts ---

export async function listContacts(db: SQLite.SQLiteDatabase): Promise<ContactRow[]> {
  return await db.getAllAsync<ContactRow>('SELECT * FROM contacts ORDER BY name ASC');
}

export async function insertContact(
  db: SQLite.SQLiteDatabase,
  input: {
    name: string;
    phone: string;
    type: ContactRow['type'];
    notes: string | null;
    meetingLocation: string | null;
  }
): Promise<number> {
  const t = nowIso();
  const res = await db.runAsync(
    `INSERT INTO contacts (name, phone, type, notes, meetingLocation, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [input.name, input.phone, input.type, input.notes, input.meetingLocation, t, t]
  );
  return Number(res.lastInsertRowId);
}

export async function updateContact(
  db: SQLite.SQLiteDatabase,
  id: number,
  input: Partial<{
    name: string;
    phone: string;
    type: ContactRow['type'];
    notes: string | null;
    meetingLocation: string | null;
  }>
) {
  const row = await db.getFirstAsync<ContactRow>('SELECT * FROM contacts WHERE id = ?', [id]);
  if (!row) return;
  const t = nowIso();
  await db.runAsync(
    `UPDATE contacts SET
      name = ?, phone = ?, type = ?, notes = ?, meetingLocation = ?, updatedAt = ?
     WHERE id = ?`,
    [
      input.name ?? row.name,
      input.phone ?? row.phone,
      input.type ?? row.type,
      input.notes !== undefined ? input.notes : row.notes,
      input.meetingLocation !== undefined ? input.meetingLocation : row.meetingLocation,
      t,
      id,
    ]
  );
}

export async function deleteContact(db: SQLite.SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM contacts WHERE id = ?', [id]);
}

export async function getContact(db: SQLite.SQLiteDatabase, id: number): Promise<ContactRow | null> {
  return (await db.getFirstAsync<ContactRow>('SELECT * FROM contacts WHERE id = ?', [id])) ?? null;
}

// --- Plans ---

export async function listPlans(db: SQLite.SQLiteDatabase): Promise<PlanRow[]> {
  const rows = await db.getAllAsync<PlanRow>('SELECT * FROM plans ORDER BY updatedAt DESC');
  return rows.map(normalizePlanRow);
}

export async function insertPlan(
  db: SQLite.SQLiteDatabase,
  input: {
    title: string;
    type: string;
    summary: string;
    householdProfileId?: number | null;
    suppliesNeededJson?: string;
    contactIdsJson?: string;
    planNotes?: string;
    reviewDate?: string | null;
  }
): Promise<number> {
  const t = nowIso();
  const res = await db.runAsync(
    `INSERT INTO plans (
      title, type, summary, createdAt, updatedAt,
      householdProfileId, suppliesNeededJson, contactIdsJson, planNotes, reviewDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.title,
      input.type,
      input.summary,
      t,
      t,
      input.householdProfileId ?? null,
      input.suppliesNeededJson ?? '[]',
      input.contactIdsJson ?? '[]',
      input.planNotes ?? '',
      input.reviewDate ?? null,
    ]
  );
  return Number(res.lastInsertRowId);
}

export async function insertPlanWithChecklist(
  db: SQLite.SQLiteDatabase,
  input: {
    title: string;
    type: string;
    summary: string;
    checklist: string[];
    suppliesNeededJson?: string;
    planNotes?: string;
    reviewDate?: string | null;
  }
): Promise<number> {
  const id = await insertPlan(db, {
    title: input.title,
    type: input.type,
    summary: input.summary,
    suppliesNeededJson: input.suppliesNeededJson ?? '[]',
    planNotes: input.planNotes ?? '',
    reviewDate: input.reviewDate ?? null,
  });
  let order = 0;
  for (const text of input.checklist) {
    await insertChecklistItem(db, {
      contextType: 'plan',
      contextId: String(id),
      text,
      orderIndex: order++,
    });
  }
  return id;
}

export async function updatePlan(
  db: SQLite.SQLiteDatabase,
  id: number,
  input: Partial<{
    title: string;
    type: string;
    summary: string;
    householdProfileId: number | null;
    suppliesNeededJson: string;
    contactIdsJson: string;
    planNotes: string;
    reviewDate: string | null;
  }>
) {
  const row = await db.getFirstAsync<PlanRow>('SELECT * FROM plans WHERE id = ?', [id]);
  if (!row) return;
  const r = normalizePlanRow(row);
  const t = nowIso();
  await db.runAsync(
    `UPDATE plans SET
      title = ?, type = ?, summary = ?, updatedAt = ?,
      householdProfileId = ?, suppliesNeededJson = ?, contactIdsJson = ?, planNotes = ?, reviewDate = ?
     WHERE id = ?`,
    [
      input.title ?? r.title,
      input.type ?? r.type,
      input.summary ?? r.summary,
      t,
      input.householdProfileId !== undefined ? input.householdProfileId : r.householdProfileId,
      input.suppliesNeededJson ?? r.suppliesNeededJson,
      input.contactIdsJson ?? r.contactIdsJson,
      input.planNotes ?? r.planNotes,
      input.reviewDate !== undefined ? input.reviewDate : r.reviewDate,
      id,
    ]
  );
}

export async function deletePlan(db: SQLite.SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM checklist_items WHERE contextType = ? AND contextId = ?', [
    'plan',
    String(id),
  ]);
  await db.runAsync('DELETE FROM plans WHERE id = ?', [id]);
}

export async function duplicatePlan(db: SQLite.SQLiteDatabase, id: number): Promise<number | null> {
  const plan = await db.getFirstAsync<PlanRow>('SELECT * FROM plans WHERE id = ?', [id]);
  if (!plan) return null;
  const p = normalizePlanRow(plan);
  const t = nowIso();
  const newTitle = `${p.title} (copy)`;
  const res = await db.runAsync(
    `INSERT INTO plans (
      title, type, summary, createdAt, updatedAt,
      householdProfileId, suppliesNeededJson, contactIdsJson, planNotes, reviewDate
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      newTitle,
      p.type,
      p.summary,
      t,
      t,
      p.householdProfileId,
      p.suppliesNeededJson,
      p.contactIdsJson,
      p.planNotes,
      p.reviewDate,
    ]
  );
  const newId = Number(res.lastInsertRowId);
  const items = await db.getAllAsync<ChecklistItemRow>(
    'SELECT * FROM checklist_items WHERE contextType = ? AND contextId = ? ORDER BY orderIndex ASC',
    ['plan', String(id)]
  );
  let order = 0;
  for (const it of items) {
    await db.runAsync(
      `INSERT INTO checklist_items (contextType, contextId, text, done, orderIndex) VALUES (?, ?, ?, 0, ?)`,
      ['plan', String(newId), it.text, order++]
    );
  }
  return newId;
}

export async function getPlan(db: SQLite.SQLiteDatabase, id: number): Promise<PlanRow | null> {
  const row = await db.getFirstAsync<PlanRow>('SELECT * FROM plans WHERE id = ?', [id]);
  return row ? normalizePlanRow(row) : null;
}

// --- Checklist ---

export async function listChecklistItems(
  db: SQLite.SQLiteDatabase,
  contextType: ChecklistContextType,
  contextId: string
): Promise<ChecklistItemRow[]> {
  return await db.getAllAsync<ChecklistItemRow>(
    'SELECT * FROM checklist_items WHERE contextType = ? AND contextId = ? ORDER BY orderIndex ASC, id ASC',
    [contextType, contextId]
  );
}

export async function insertChecklistItem(
  db: SQLite.SQLiteDatabase,
  input: {
    contextType: ChecklistContextType;
    contextId: string;
    text: string;
    orderIndex: number;
  }
) {
  await db.runAsync(
    `INSERT INTO checklist_items (contextType, contextId, text, done, orderIndex) VALUES (?, ?, ?, 0, ?)`,
    [input.contextType, input.contextId, input.text, input.orderIndex]
  );
}

export async function setChecklistItemDone(
  db: SQLite.SQLiteDatabase,
  id: number,
  done: boolean
) {
  await db.runAsync('UPDATE checklist_items SET done = ? WHERE id = ?', [done ? 1 : 0, id]);
}

export async function deleteChecklistItemsForContext(
  db: SQLite.SQLiteDatabase,
  contextType: ChecklistContextType,
  contextId: string
) {
  await db.runAsync('DELETE FROM checklist_items WHERE contextType = ? AND contextId = ?', [
    contextType,
    contextId,
  ]);
}

export async function replaceEmergencyChecklist(
  db: SQLite.SQLiteDatabase,
  contextId: string,
  lines: string[]
) {
  await deleteChecklistItemsForContext(db, 'emergency', contextId);
  let i = 0;
  for (const text of lines) {
    await insertChecklistItem(db, {
      contextType: 'emergency',
      contextId,
      text,
      orderIndex: i++,
    });
  }
}

// --- Guides ---

export async function listGuides(
  db: SQLite.SQLiteDatabase,
  query?: string,
  bookmarkedOnly?: boolean,
  libraryGroup?: LibraryGroup | 'all'
): Promise<GuideRow[]> {
  const search = query?.trim();
  const group = libraryGroup ?? 'all';
  const groupSql =
    group === 'all' ? '' : group === 'emergency' ? ` AND libraryGroup = 'emergency'` : ` AND libraryGroup = 'self_reliance'`;

  if (search && bookmarkedOnly) {
    const q = `%${search}%`;
    const rows = await db.getAllAsync<GuideRow>(
      `SELECT * FROM guides WHERE bookmarked = 1 AND (title LIKE ? OR overview LIKE ? OR category LIKE ? OR tagsJson LIKE ?)${groupSql} ORDER BY priority DESC, title ASC`,
      [q, q, q, q]
    );
    return rows.map(normalizeGuideRow);
  }
  if (bookmarkedOnly) {
    const rows = await db.getAllAsync<GuideRow>(
      `SELECT * FROM guides WHERE bookmarked = 1${groupSql} ORDER BY priority DESC, title ASC`
    );
    return rows.map(normalizeGuideRow);
  }
  if (search) {
    const q = `%${search}%`;
    const rows = await db.getAllAsync<GuideRow>(
      `SELECT * FROM guides WHERE (title LIKE ? OR overview LIKE ? OR category LIKE ? OR tagsJson LIKE ?)${groupSql} ORDER BY priority DESC, title ASC`,
      [q, q, q, q]
    );
    return rows.map(normalizeGuideRow);
  }
  const rows = await db.getAllAsync<GuideRow>(
    `SELECT * FROM guides WHERE 1=1${groupSql} ORDER BY priority DESC, title ASC`
  );
  return rows.map(normalizeGuideRow);
}

export async function getGuidesBySlugs(
  db: SQLite.SQLiteDatabase,
  slugs: string[]
): Promise<GuideRow[]> {
  if (slugs.length === 0) return [];
  const placeholders = slugs.map(() => '?').join(',');
  const rows = await db.getAllAsync<GuideRow>(
    `SELECT * FROM guides WHERE slug IN (${placeholders}) ORDER BY title ASC`,
    slugs
  );
  return rows.map(normalizeGuideRow);
}

export async function getGuide(db: SQLite.SQLiteDatabase, id: number): Promise<GuideRow | null> {
  const row = await db.getFirstAsync<GuideRow>('SELECT * FROM guides WHERE id = ?', [id]);
  return row ? normalizeGuideRow(row) : null;
}

export async function setGuideBookmarked(
  db: SQLite.SQLiteDatabase,
  id: number,
  bookmarked: boolean
) {
  await db.runAsync('UPDATE guides SET bookmarked = ? WHERE id = ?', [bookmarked ? 1 : 0, id]);
}

// --- Household profile (single row) ---

export async function getHouseholdProfile(
  db: SQLite.SQLiteDatabase
): Promise<HouseholdProfileRow | null> {
  return (
    (await db.getFirstAsync<HouseholdProfileRow>(
      'SELECT * FROM household_profile ORDER BY id ASC LIMIT 1'
    )) ?? null
  );
}

export async function saveHouseholdProfile(
  db: SQLite.SQLiteDatabase,
  input: Partial<
    Omit<HouseholdProfileRow, 'id' | 'updatedAt'> & { id?: number }
  >
) {
  const existing = await getHouseholdProfile(db);
  const t = nowIso();
  if (!existing) {
    await db.runAsync(
      `INSERT INTO household_profile (
        peopleCount, adults, children, dietaryNotes, medicineNotes,
        waterUsePerDay, foodUsePerDay, heatingType, cookingType, vehicleFuelAccess, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.peopleCount ?? 1,
        input.adults ?? 1,
        input.children ?? 0,
        input.dietaryNotes ?? '',
        input.medicineNotes ?? '',
        input.waterUsePerDay ?? 2,
        input.foodUsePerDay ?? 2000,
        input.heatingType ?? '',
        input.cookingType ?? '',
        input.vehicleFuelAccess ?? '',
        t,
      ]
    );
    return;
  }
  await db.runAsync(
    `UPDATE household_profile SET
      peopleCount = ?, adults = ?, children = ?, dietaryNotes = ?, medicineNotes = ?,
      waterUsePerDay = ?, foodUsePerDay = ?, heatingType = ?, cookingType = ?, vehicleFuelAccess = ?, updatedAt = ?
     WHERE id = ?`,
    [
      input.peopleCount ?? existing.peopleCount,
      input.adults ?? existing.adults,
      input.children ?? existing.children,
      input.dietaryNotes !== undefined ? input.dietaryNotes : existing.dietaryNotes,
      input.medicineNotes !== undefined ? input.medicineNotes : existing.medicineNotes,
      input.waterUsePerDay ?? existing.waterUsePerDay,
      input.foodUsePerDay ?? existing.foodUsePerDay,
      input.heatingType !== undefined ? input.heatingType : existing.heatingType,
      input.cookingType !== undefined ? input.cookingType : existing.cookingType,
      input.vehicleFuelAccess !== undefined ? input.vehicleFuelAccess : existing.vehicleFuelAccess,
      t,
      existing.id,
    ]
  );
}

// --- Settings (key-value) ---

export async function getSetting(db: SQLite.SQLiteDatabase, key: string): Promise<string | null> {
  const row = await db.getFirstAsync<{ value: string }>('SELECT value FROM settings WHERE key = ?', [
    key,
  ]);
  return row?.value ?? null;
}

export async function setSetting(db: SQLite.SQLiteDatabase, key: string, value: string) {
  await db.runAsync(
    `INSERT INTO settings (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
    [key, value]
  );
}

// --- Saved locations ---

function normalizeSavedLocationType(raw: string): SavedLocationType {
  if (raw === 'meeting' || raw === 'evacuation' || raw === 'shelter' || raw === 'other') {
    return raw;
  }
  return 'other';
}

export async function listSavedLocations(db: SQLite.SQLiteDatabase): Promise<SavedLocationRow[]> {
  const rows = await db.getAllAsync<{
    id: number;
    name: string;
    address: string;
    type: string;
  }>('SELECT * FROM saved_locations ORDER BY name ASC');
  return rows.map((r) => ({
    ...r,
    type: normalizeSavedLocationType(r.type),
  }));
}

export async function getSavedLocation(
  db: SQLite.SQLiteDatabase,
  id: number
): Promise<SavedLocationRow | null> {
  const row = await db.getFirstAsync<{
    id: number;
    name: string;
    address: string;
    type: string;
  }>('SELECT * FROM saved_locations WHERE id = ?', [id]);
  if (!row) return null;
  return { ...row, type: normalizeSavedLocationType(row.type) };
}

export async function insertSavedLocation(
  db: SQLite.SQLiteDatabase,
  input: { name: string; address: string; type: SavedLocationType }
): Promise<number> {
  const res = await db.runAsync(
    `INSERT INTO saved_locations (name, address, type) VALUES (?, ?, ?)`,
    [input.name, input.address, input.type]
  );
  return Number(res.lastInsertRowId);
}

export async function updateSavedLocation(
  db: SQLite.SQLiteDatabase,
  id: number,
  input: Partial<{ name: string; address: string; type: SavedLocationType }>
) {
  const row = await getSavedLocation(db, id);
  if (!row) return;
  await db.runAsync(
    `UPDATE saved_locations SET name = ?, address = ?, type = ? WHERE id = ?`,
    [
      input.name ?? row.name,
      input.address ?? row.address,
      input.type ?? row.type,
      id,
    ]
  );
}

export async function deleteSavedLocation(db: SQLite.SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM saved_locations WHERE id = ?', [id]);
}
