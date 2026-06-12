import express from 'express';
import db from '../create_db.js';

const router = express.Router();


router.get('/', (req, res) => {
    const posts = db.prepare('SELECT * FROM Posts ORDER BY date DESC').all();
    res.json(posts);
})

router.post('/', (req, res) => {
    const posts
})

export default router;