import express from 'express';
import db from '../create_db.js';
import { requireAuth } from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'data/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5 Mo

const router = express.Router();


router.get('/', (req, res) => {
  const { category_id, user_id, liked_by } = req.query;

  const conditions = [];
  if (category_id) conditions.push(`Post_Categories.category_id = ${Number(category_id)}`);
  if (user_id) conditions.push(`Posts.user_id = ${Number(user_id)}`);
  if (liked_by) conditions.push(`pl_filter.post_id IS NOT NULL`);
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';

  const query = `
    SELECT Posts.*, Users.username as author,
        GROUP_CONCAT(DISTINCT Categories.name) as category
    FROM Posts
    LEFT JOIN Users ON Posts.user_id = Users.id
    LEFT JOIN Post_Categories ON Posts.id = Post_Categories.post_id
    LEFT JOIN Categories ON Post_Categories.category_id = Categories.id
    ${liked_by ? `LEFT JOIN Post_likes AS pl_filter ON Posts.id = pl_filter.post_id AND pl_filter.user_id = ${Number(liked_by)} AND pl_filter.value = 1` : ''}
    ${where}
    GROUP BY Posts.id
    ORDER BY Posts.date DESC
  `;

  const posts = db.prepare(query).all();
    
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


router.post('/', requireAuth, upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const category_ids = Array.isArray(req.body.category_ids)
      ? req.body.category_ids.map(Number)
      : [Number(req.body.category_ids)];

    if (!title?.trim() || !content?.trim() || !category_ids?.length) {
        return res.status(400).json({ message: 'Champs manquants' });
    }

    const result = db.prepare(`
        INSERT INTO Posts (user_id, category_id, title, content, image)
        VALUES (?, ?, ?, ?, ?)
    `).run(req.user.id, category_ids[0], title, content, req.file ? '/uploads/' + req.file.filename : null);

    const postId = result.lastInsertRowid;

    // Insérer toutes les catégories dans Post_Categories
    const insertCat = db.prepare(
        'INSERT INTO Post_Categories (post_id, category_id) VALUES (?, ?)'
    );
    for (const catId of category_ids) {
        insertCat.run(postId, catId);
    }

    res.status(201).json({ id: postId, title, content, image: req.file ? '/uploads/' + req.file.filename : null, user_id: req.user.id, likes: 0, dislikes: 0, comments: [], categories: [] });
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

router.delete('/:postId/comments/:commentId', requireAuth, (req, res) => {
    const commentId = Number(req.params.commentId);

    const comment = db.prepare('SELECT * FROM Comments WHERE id = ?').get(commentId);
    if (!comment) return res.status(404).json({ message: 'Commentaire introuvable' });
    if (comment.user_id !== req.user.id) return res.status(403).json({ message: 'Non autorisé' });

    db.prepare('DELETE FROM Comments WHERE id = ?').run(commentId);
    res.json({ message: 'Commentaire supprimé' });
});

router.delete('/:id', requireAuth, (req, res) => {
    const postId = Number(req.params.id);

    const post = db.prepare('SELECT * FROM Posts WHERE id = ?').get(postId);
    if (!post) return res.status(404).json({ message: 'Post introuvable' });
    if (post.user_id !== req.user.id) return res.status(403).json({ message: 'Non autorisé' });

    db.prepare('DELETE FROM Post_likes WHERE post_id = ?').run(postId);
    db.prepare('DELETE FROM Comments WHERE post_id = ?').run(postId);
    db.prepare('DELETE FROM Post_Categories WHERE post_id = ?').run(postId);
    db.prepare('DELETE FROM Posts WHERE id = ?').run(postId);

    res.json({ message: 'Post supprimé' });
});

export default router;