import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import express, { Router } from 'express';
import db from '../create_db.js';

const router = Router();
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'All fields are required'});
        }

        const userExists = db.prepare(`SELECT * FROM Users WHERE email = ?`).get(email);
        if (userExists) {
            return res.status(400).json({ message: 'User already exists'});
        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const newUser = db.prepare(`INSERT INTO Users (email, username, password) VALUES (?, ?, ?)`).run(email, username, hashedPassword)
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = db.prepare(`SELECT * FROM Users WHERE email = ?`).get(email);
        if (!user) {
            return res.status(400).json({ message: 'Invalid credencials' });
        }

        const verifyPassword = await bcrypt.compare(password, user.password);
        if (!verifyPassword) {
            return res.status(400).json({ message: 'Invalid credencials' });
        }

        const token = jwt.sign({ id: user.id }, process.env.JWT_KEY, { expiresIn: '2h'});
        res.json({ message: 'Login successfully', token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router