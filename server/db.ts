import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '..', 'data.db');
const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id TEXT PRIMARY KEY,
    form TEXT NOT NULL,
    data TEXT NOT NULL,
    submitted TEXT NOT NULL
  )
`);

const insertStmt = db.prepare(
  'INSERT INTO entries (id, form, data, submitted) VALUES (?, ?, ?, ?)'
);

export interface EntryRow {
  id: string;
  form: string;
  data: string;
  submitted: string;
}

export function getAll(): EntryRow[] {
  return db.prepare('SELECT * FROM entries ORDER BY rowid DESC').all() as EntryRow[];
}

export function getById(id: string): EntryRow | undefined {
  return db.prepare('SELECT * FROM entries WHERE id = ?').get(id) as EntryRow | undefined;
}

export function add(id: string, form: string, data: Record<string, unknown>, submitted: string): void {
  insertStmt.run(id, form, JSON.stringify(data), submitted);
}

export function remove(id: string): void {
  db.prepare('DELETE FROM entries WHERE id = ?').run(id);
}

export function clearAll(): void {
  db.prepare('DELETE FROM entries').run();
}
