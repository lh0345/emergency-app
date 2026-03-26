import type * as SQLite from 'expo-sqlite';

import type {
  ChecklistContextType,
  ChecklistItemRow,
  ContactRow,
  GuideRow,
  PlanRow,
  SupplyCategory,
  SupplyRow,
} from '@/types';

function nowIso() {
  return new Date().toISOString();
}

export async function seedIfEmpty(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ c: number }>('SELECT COUNT(*) as c FROM guides');
  if (row && row.c > 0) return;

  const guides = getSeedGuides();
  for (const g of guides) {
    await db.runAsync(
      `INSERT INTO guides (title, category, overview, stepsJson, suppliesJson, mistakesJson, safetyNote, bookmarked)
       VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
      [
        g.title,
        g.category,
        g.overview,
        g.stepsJson,
        g.suppliesJson,
        g.mistakesJson,
        g.safetyNote,
      ]
    );
  }
}

function getSeedGuides() {
  return [
    {
      title: 'First 10 minutes of a power outage',
      category: 'Power',
      overview: 'Stabilize light, preserve food temperature, and protect devices.',
      stepsJson: JSON.stringify([
        { title: 'Confirm scope', detail: 'Check breakers and neighbors if safe.' },
        { title: 'Light', detail: 'Use flashlights; avoid candles near flammables.' },
        { title: 'Fridge', detail: 'Keep doors closed; food stays cold for hours if sealed.' },
      ]),
      suppliesJson: JSON.stringify(['Flashlight', 'Power bank', 'Battery radio']),
      mistakesJson: JSON.stringify(['Opening freezer repeatedly', 'Using generators indoors']),
      safetyNote: 'Never run generators or grills indoors — carbon monoxide kills.',
    },
    {
      title: 'Water outage: drinking safety',
      category: 'Water',
      overview: 'Prioritize drinking water and reduce non-essential use.',
      stepsJson: JSON.stringify([
        { title: 'Drinking', detail: 'Use sealed bottled water first.' },
        { title: 'Hygiene', detail: 'Hand sanitizer for hands; reserve water for drinking if scarce.' },
        { title: 'Listen', detail: 'Follow boil-water advisories from authorities.' },
      ]),
      suppliesJson: JSON.stringify(['Bottled water', 'Wipes', 'Buckets']),
      mistakesJson: JSON.stringify(['Drinking flood water', 'Ignoring boil notices']),
      safetyNote: 'When in doubt, use bottled or treated water for drinking.',
    },
    {
      title: 'Evacuation go-bag checklist',
      category: 'Evacuation',
      overview: 'Leave fast with IDs, meds, and a way to charge your phone.',
      stepsJson: JSON.stringify([
        { title: 'IDs & cash', detail: 'Wallet, cards, small cash.' },
        { title: 'Meds', detail: '7-day supply if possible; list of prescriptions.' },
        { title: 'Charge', detail: 'Phone, cable, power bank.' },
      ]),
      suppliesJson: JSON.stringify(['Backpack', 'Water bottles', 'First aid']),
      mistakesJson: JSON.stringify(['Delaying to pack non-essentials', 'Forgetting chargers']),
      safetyNote: 'If ordered to evacuate, go — roads may clog quickly.',
    },
  ];
}

// --- Supplies ---

export async function listSupplies(db: SQLite.SQLiteDatabase): Promise<SupplyRow[]> {
  const rows = await db.getAllAsync<SupplyRow>(
    'SELECT * FROM supplies ORDER BY category ASC, name ASC'
  );
  return rows;
}

export async function insertSupply(
  db: SQLite.SQLiteDatabase,
  input: {
    name: string;
    category: SupplyCategory;
    quantity: number;
    unit: string;
    expiryDate: string | null;
    location: string | null;
    notes: string | null;
  }
): Promise<number> {
  const t = nowIso();
  const res = await db.runAsync(
    `INSERT INTO supplies (name, category, quantity, unit, expiryDate, location, notes, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.category,
      input.quantity,
      input.unit,
      input.expiryDate,
      input.location,
      input.notes,
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
    quantity: number;
    unit: string;
    expiryDate: string | null;
    location: string | null;
    notes: string | null;
  }>
) {
  const row = await db.getFirstAsync<SupplyRow>('SELECT * FROM supplies WHERE id = ?', [id]);
  if (!row) return;
  const t = nowIso();
  await db.runAsync(
    `UPDATE supplies SET
      name = ?, category = ?, quantity = ?, unit = ?, expiryDate = ?, location = ?, notes = ?, updatedAt = ?
     WHERE id = ?`,
    [
      input.name ?? row.name,
      input.category ?? row.category,
      input.quantity ?? row.quantity,
      input.unit ?? row.unit,
      input.expiryDate !== undefined ? input.expiryDate : row.expiryDate,
      input.location !== undefined ? input.location : row.location,
      input.notes !== undefined ? input.notes : row.notes,
      t,
      id,
    ]
  );
}

export async function deleteSupply(db: SQLite.SQLiteDatabase, id: number) {
  await db.runAsync('DELETE FROM supplies WHERE id = ?', [id]);
}

export async function getSupply(db: SQLite.SQLiteDatabase, id: number): Promise<SupplyRow | null> {
  return (
    (await db.getFirstAsync<SupplyRow>('SELECT * FROM supplies WHERE id = ?', [id])) ?? null
  );
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
  return await db.getAllAsync<PlanRow>('SELECT * FROM plans ORDER BY updatedAt DESC');
}

export async function insertPlan(
  db: SQLite.SQLiteDatabase,
  input: { title: string; type: string; summary: string }
): Promise<number> {
  const t = nowIso();
  const res = await db.runAsync(
    `INSERT INTO plans (title, type, summary, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
    [input.title, input.type, input.summary, t, t]
  );
  return Number(res.lastInsertRowId);
}

export async function updatePlan(
  db: SQLite.SQLiteDatabase,
  id: number,
  input: Partial<{ title: string; type: string; summary: string }>
) {
  const row = await db.getFirstAsync<PlanRow>('SELECT * FROM plans WHERE id = ?', [id]);
  if (!row) return;
  const t = nowIso();
  await db.runAsync(
    `UPDATE plans SET title = ?, type = ?, summary = ?, updatedAt = ? WHERE id = ?`,
    [input.title ?? row.title, input.type ?? row.type, input.summary ?? row.summary, t, id]
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
  const t = nowIso();
  const newTitle = `${plan.title} (copy)`;
  const res = await db.runAsync(
    `INSERT INTO plans (title, type, summary, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
    [newTitle, plan.type, plan.summary, t, t]
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
  return (await db.getFirstAsync<PlanRow>('SELECT * FROM plans WHERE id = ?', [id])) ?? null;
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
  bookmarkedOnly?: boolean
): Promise<GuideRow[]> {
  const search = query?.trim();
  if (search && bookmarkedOnly) {
    const q = `%${search}%`;
    return await db.getAllAsync<GuideRow>(
      `SELECT * FROM guides WHERE bookmarked = 1 AND (title LIKE ? OR overview LIKE ? OR category LIKE ?) ORDER BY title ASC`,
      [q, q, q]
    );
  }
  if (bookmarkedOnly) {
    return await db.getAllAsync<GuideRow>(
      'SELECT * FROM guides WHERE bookmarked = 1 ORDER BY title ASC'
    );
  }
  if (search) {
    const q = `%${search}%`;
    return await db.getAllAsync<GuideRow>(
      'SELECT * FROM guides WHERE title LIKE ? OR overview LIKE ? OR category LIKE ? ORDER BY title ASC',
      [q, q, q]
    );
  }
  return await db.getAllAsync<GuideRow>('SELECT * FROM guides ORDER BY title ASC');
}

export async function getGuide(db: SQLite.SQLiteDatabase, id: number): Promise<GuideRow | null> {
  return (await db.getFirstAsync<GuideRow>('SELECT * FROM guides WHERE id = ?', [id])) ?? null;
}

export async function setGuideBookmarked(
  db: SQLite.SQLiteDatabase,
  id: number,
  bookmarked: boolean
) {
  await db.runAsync('UPDATE guides SET bookmarked = ? WHERE id = ?', [bookmarked ? 1 : 0, id]);
}
