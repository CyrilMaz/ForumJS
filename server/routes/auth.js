import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
const db = require('better-sqlite3')('../create_db.db');
const router = express.Router();

router.post('/register', async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Tous les champs sont necessaires'});
        }
    }
})