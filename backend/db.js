const Database = require('better-sqlite3');
const db = new Database('todos.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    manga_id TEXT NOT NULL,
    title TEXT NOT NULL,
    cover_url TEXT,
    added_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, manga_id)
  )
`);

db.exec(`
  CREATE TABLE IF NOT EXISTS history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    manga_id TEXT NOT NULL,
    manga_title TEXT NOT NULL,
    cover_url TEXT,
    chapter_id TEXT NOT NULL,
    chapter_number TEXT,
    read_at TEXT DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, chapter_id)
  )
`);



module.exports = db;