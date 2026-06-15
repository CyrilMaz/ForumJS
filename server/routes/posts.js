import express from 'express';
import db from '../create_db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();


router.get('/', (req, res) => {
  const posts = db.prepare('SELECT * FROM Posts ORDER BY date DESC').all()
  const result = posts.map(post => ({
    ...post,
    likes: 0,
    dislikes: 0,
    comments: []
  }))
  res.json(result)
})


router.post('/', requireAuth, (req, res) => {
    const { title, content } = req.body

    const result = db.prepare(`
        INSERT INTO Posts ( user_id, category_id, title, content)
        VALUES (?, 1, ?, ?) 
        `).run(req.user.id, title, content) // PLACEHOLDER : Values ( 1, 1, ?, ?) futurement (?, ?, ?, ?) avec l'auth fonctionnelle

        res.json({ id: result.lastInsertRowid, title, content, likes: 0, dislikes: 0, comments: [] })
})

export default router;