const express = require('express');
const router = express.Router();
const db = require('../db.js');

router.get('/', (req, res) => {
  const todos = db.prepare('SELECT * FROM todos').all();
  res.json(todos);
});

router.get('/:id', (req, res) => {
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!todo) return res.status(404).json({ message: 'Tidak ditemukan' });
  res.json(todo);
});

router.post('/', (req, res) => {
  const stmt = db.prepare('INSERT INTO todos (task) VALUES (?)');
  const result = stmt.run(req.body.task);
  const newTodo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(newTodo);
});

router.put('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Tidak ditemukan' });

  const task = req.body.task ?? existing.task;
  const done = req.body.done ?? existing.done;
  db.prepare('UPDATE todos SET task = ?, done = ? WHERE id = ?').run(task, done, req.params.id);

  const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  res.json(updated);
});

router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ message: 'Tidak ditemukan' });

  db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
  res.json({ message: 'Berhasil dihapus', deleted: existing });
});

module.exports = router;