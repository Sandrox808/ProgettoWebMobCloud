const express = require('express');
const router = express.Router();
const { getDB } = require('../database/db');
const { hashPassword, generateRandomString } = require('../utils/security');

// 1. REGISTRAZIONE
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Dati mancanti" });

        const db = await getDB();
        
        const [existing] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
        if (existing.length > 0) return res.status(400).json({ error: "Username già in uso" });

        const salt = generateRandomString(16);
        const hashedPassword = hashPassword(password, salt);

        const [result] = await db.execute(
            'INSERT INTO users (username, salt, password) VALUES (?, ?, ?)',
            [username, salt, hashedPassword]
        );

        const [lastQueueResult] = await db.execute('SELECT MAX(order_num) as maxOrder FROM queue');
        const lastQueue = lastQueueResult[0];
        const newOrder = (lastQueue.maxOrder || 0) + 1;
        await db.execute('INSERT INTO queue (user_id, order_num) VALUES (?, ?)', [result.insertId, newOrder]);

        res.status(201).json({ message: "Registrazione OK", userId: result.insertId });
    } catch (error) {
        console.error("Errore Auth:", error);
        res.status(500).json({ error: "Errore server" });
    }
});

// 2. LOGIN
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ error: "Dati mancanti" });

        const db = await getDB();
        const [users] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        const user = users[0];

        if (!user) return res.status(401).json({ error: "Credenziali errate" });

        const inputHash = hashPassword(password, user.salt);
        if (inputHash !== user.password) return res.status(401).json({ error: "Credenziali errate" });

        const token = generateRandomString(32);
        await db.execute('UPDATE users SET token = ? WHERE id = ?', [token, user.id]);

        res.json({ message: "Login effettuato", token, username: user.username });
    } catch (error) {
        res.status(500).json({ error: "Errore server" });
    }
});

module.exports = router;