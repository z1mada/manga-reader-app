const Database = require('better-sqlite3');
const db = new Database('todos.db');

// Bikin tabel kalau belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT NOT NULL,
    done INTEGER DEFAULT 0
  )
`);

module.exports = db;