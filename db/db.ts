import * as SQLite from 'expo-sqlite';

import { MIGRATIONS, SCHEMA_VERSION } from '@/db/schema';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export async function openDb(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) return dbInstance;
  dbInstance = await SQLite.openDatabaseAsync('emergency.db');
  await runMigrations(dbInstance);
  return dbInstance;
}

async function runMigrations(db: SQLite.SQLiteDatabase) {
  const row = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let version = row?.user_version ?? 0;

  while (version < SCHEMA_VERSION) {
    const next = version + 1;
    const statements = MIGRATIONS[next];
    if (!statements) {
      throw new Error(`Missing migration for version ${next}`);
    }
    await db.execAsync('BEGIN');
    try {
      for (const sql of statements) {
        await db.execAsync(sql);
      }
      await db.execAsync(`PRAGMA user_version = ${next}`);
      await db.execAsync('COMMIT');
    } catch (e) {
      await db.execAsync('ROLLBACK');
      throw e;
    }
    version = next;
  }
}

export function getDbSync(): SQLite.SQLiteDatabase | null {
  return dbInstance;
}
