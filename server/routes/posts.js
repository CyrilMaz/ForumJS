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

router.patch('/:id/vote', requireAuth, (req, res) => {
    const postId = Number(req.params.id);
    const userId = req.user.id;
    const { value } = req.body; // 1 = like, 0 = dislike

    const existing = db.prepare(
        'SELECT * FROM Post_likes WHERE user_id = ? AND post_id = ?'
    ).get(userId, postId);

    if (!existing) {
      // Insert
        db.prepare('INSERT INTO Post_likes (user_id, post_id, value) VALUES (?, ?, ?)').run(userId, postId, value);
    } else if (existing.value === value) {
      // Delete
        db.prepare('DELETE FROM Post_likes WHERE user_id = ? AND post_id = ?').run(userId, postId);
    } else {
      // Update
        db.prepare('UPDATE Post_likes SET value = ? WHERE user_id = ? AND post_id = ?').run(value, userId, postId);
    }

    const counts = db.prepare(`
        SELECT 
            COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0) as likes,
            COALESCE(SUM(CASE WHEN value = 0 THEN 1 ELSE 0 END), 0) as dislikes
        FROM Post_likes WHERE post_id = ?
    `).get(postId);

    res.json(counts);
});

router.get('/:id/comments', (req, res) => {
    const postId = Number(req.params.id);
    const comments = db.prepare(`
      SELECT Comments.*, Users.username as author
      FROM Comments 
      JOIN Users ON Comments.user_id = Users.id 
      WHERE post_id = ?
      `).all(postId);
    res.json(comments);
});

router.post('/:id/comments', requireAuth, (req, res) => {
    const postId = Number(req.params.id);
    const { content } = req.body;

    const result = db.prepare(`
        INSERT INTO Comments (post_id, user_id, content)
        VALUES ( ?, ?, ?)
        `).run(postId, req.user.id, content);

    res.json({ id: result.lastInsertRowid, post_id: postId, user_id: req.user.id, username: req.user.username, content });
});


export default router;