const Database = require('better-sqlite3');
const path = require('path');

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

function getAll() {
  return db.prepare('SELECT * FROM entries ORDER BY rowid DESC').all();
}

function add(id, form, data, submitted) {
  insertStmt.run(id, form, JSON.stringify(data), submitted);
}

function remove(id) {
  db.prepare('DELETE FROM entries WHERE id = ?').run(id);
}

function clearAll() {
  db.prepare('DELETE FROM entries').run();
}

module.exports = { getAll, add, remove, clearAll };
