import express from 'express';
import db from '../create_db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();


router.get('/', (req, res) => {
  const posts = db.prepare(`
    SELECT Posts.*, Users.username as author,
    GROUP_CONCAT(Categories.name, ', ') as category
    FROM Posts
    LEFT JOIN Users ON Posts.user_id = Users.id
    LEFT JOIN Post_Categories ON Posts.id = Post_Categories.post_id
    LEFT JOIN Categories ON Post_Categories.category_id = Categories.id
    GROUP BY Posts.id
    ORDER BY Posts.date DESC
    `).all()
    
  const getComments = db.prepare(`
  SELECT Comments.*, Users.username as author
  FROM Comments
  JOIN Users ON Comments.user_id = Users.id
  WHERE Comments.post_id = ?
  ORDER BY Comments.date ASC
`);

const getCounts = db.prepare(`
  SELECT
  COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0) as likes,
  COALESCE(SUM(CASE WHEN value = 0 THEN 1 ELSE 0 END), 0) as dislikes
  FROM Post_likes WHERE post_id = ?
`);

const result = posts.map(post => ({
  ...post,
  ...getCounts.get(post.id),
  comments: getComments.all(post.id)
}))
  res.json(result)
})


router.post('/', requireAuth, (req, res) => {
    const { title, content, category_ids } = req.body; // tableau ex: [1, 3]

    if (!title?.trim() || !content?.trim() || !category_ids?.length) {
        return res.status(400).json({ message: 'Champs manquants' });
    }

    const result = db.prepare(`
        INSERT INTO Posts (user_id, category_id, title, content)
        VALUES (?, ?, ?, ?)
    `).run(req.user.id, category_ids[0], title, content);

    const postId = result.lastInsertRowid;

    // Insérer toutes les catégories dans Post_Categories
    const insertCat = db.prepare(
        'INSERT INTO Post_Categories (post_id, category_id) VALUES (?, ?)'
    );
    for (const catId of category_ids) {
        insertCat.run(postId, catId);
    }

    res.status(201).json({ id: postId, title, content, likes: 0, dislikes: 0, comments: [], categories: [] });
});

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

    res.json({ id: result.lastInsertRowid, post_id: postId, user_id: req.user.id, author: req.user.username, content });
});


export default router;