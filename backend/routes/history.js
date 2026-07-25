const express = require('express');
const router = express.Router();
const db = require('../db.js');
const requireAuth = require('../middleware/auth.js');

router.use(requireAuth);

// POST — catat/update chapter yang baru dibaca
router.post('/', (req, res) => {
  const { manga_id, manga_title, cover_url, chapter_id, chapter_number } = req.body;

  if (!manga_id || !manga_title || !chapter_id) {
    return res.status(400).json({ message: 'manga_id, manga_title, dan chapter_id wajib diisi' });
  }

  db.prepare(`
    INSERT INTO history (user_id, manga_id, manga_title, cover_url, chapter_id, chapter_number, read_at)
    VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(user_id, chapter_id)
    DO UPDATE SET read_at = CURRENT_TIMESTAMP
  `).run(req.userId, manga_id, manga_title, cover_url, chapter_id, chapter_number);

  res.status(201).json({ message: 'Riwayat baca tersimpan' });
});

// GET — daftar manga yang pernah dibaca (1 manga = 1 entri, chapter terakhir)
router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT manga_id, manga_title, cover_url, chapter_number, MAX(read_at) as read_at
    FROM history
    WHERE user_id = ?
    GROUP BY manga_id
    ORDER BY read_at DESC
  `).all(req.userId);

  res.json(rows);
});

// GET — semua chapter_id yang pernah dibaca untuk 1 manga tertentu (buat dimming)
router.get('/manga/:manga_id', (req, res) => {
  const rows = db.prepare(`
    SELECT chapter_id FROM history WHERE user_id = ? AND manga_id = ?
  `).all(req.userId, req.params.manga_id);

  res.json(rows.map(r => r.chapter_id));
});

module.exports = router;