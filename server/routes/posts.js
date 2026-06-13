import express from 'express';
import db from '../create_db.js';

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


router.post('/', (req, res) => {
    const { title, content } = req.body

    const result = db.prepare(`
        INSERT INTO Posts ( user_id, category_id, title, content)
        VALUES (1, 1, ?, ?) 
        `).run(title, content) // PLACEHOLDER : Values ( 1, 1, ?, ?) futurement (?, ?, ?, ?) avec l'auth fonctionnelle

        res.json({ id: result.lastInsertRowid, title, content, likes: 0, dislikes: 0, comments: [] })
})

export default router;