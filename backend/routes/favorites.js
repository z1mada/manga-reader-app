const express = require('express');
const router = express.Router();
const db = require('../db.js');
const requireAuth = require('../middleware/auth.js');

router.use(requireAuth); // semua route di bawah ini WAJIB login dulu

router.get('/', (req, res) => {
  const favorites = db.prepare('SELECT * FROM favorites WHERE user_id = ? ORDER BY added_at DESC').all(req.userId);
  res.json(favorites);
});

router.post('/', (req, res) => {
  const { manga_id, title, cover_url } = req.body;

  if (!manga_id || !title) {
    return res.status(400).json({ message: 'manga_id dan title wajib diisi' });
  }

  try {
    const stmt = db.prepare('INSERT INTO favorites (user_id, manga_id, title, cover_url) VALUES (?, ?, ?, ?)');
    const result = stmt.run(req.userId, manga_id, title, cover_url);
    const newFavorite = db.prepare('SELECT * FROM favorites WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newFavorite);
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ message: 'Manga ini sudah difavoritkan' });
    }
    res.status(500).json({ message: 'Terjadi kesalahan server' });
  }
});

router.delete('/:manga_id', (req, res) => {
  const existing = db.prepare('SELECT * FROM favorites WHERE manga_id = ? AND user_id = ?').get(req.params.manga_id, req.userId);
  if (!existing) return res.status(404).json({ message: 'Tidak ditemukan di favorite' });

  db.prepare('DELETE FROM favorites WHERE manga_id = ? AND user_id = ?').run(req.params.manga_id, req.userId);
  res.json({ message: 'Berhasil dihapus dari favorite', deleted: existing });
});

module.exports = router;