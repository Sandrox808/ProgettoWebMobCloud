const express = require('express');
const router = express.Router();
const { getDB } = require('../database/db');
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth);

async function normalizeQueue(db) {
    const rows = await db.all('SELECT id FROM queue ORDER BY order_num ASC');
    
    for (let i = 0; i < rows.length; i++) {
        await db.run('UPDATE queue SET order_num = ? WHERE id = ?', [i + 1, rows[i].id]);
    }
}

// 1. GET /queue
router.get('/queue', async (req, res) => {
    try {
        const db = await getDB();
        const queue = await db.all(`
            SELECT u.username, u.id as user_id, q.order_num, q.last_skipped 
            FROM queue q 
            JOIN users u ON q.user_id = u.id 
            ORDER BY q.order_num ASC
        `);

        const firstUser = queue.length > 0 ? queue[0] : null;
        const isMyTurn = firstUser && firstUser.user_id === req.user.id;

        res.json({ queue, currentUser: req.user.username, isMyTurn });
    } catch (error) {
        console.error("[ERR] Lettura coda:", error);
        res.status(500).json({ error: "Errore server" });
    }
});

// 2. POST /action/done
router.post('/action/done', async (req, res) => {
    try {
        const { note } = req.body;
        const db = await getDB();
        const first = await db.get('SELECT user_id FROM queue ORDER BY order_num ASC LIMIT 1');

        if (!first || first.user_id !== req.user.id) {
            return res.status(403).json({ error: "Non tocca a te!" });
        }

        const last = await db.get('SELECT MAX(order_num) as maxOrder FROM queue');
        const tempHighOrder = (last.maxOrder || 0) + 1000;

        await db.run('UPDATE queue SET order_num = ?, last_skipped = NULL WHERE user_id = ?', 
            [tempHighOrder, req.user.id]);

        await normalizeQueue(db);

        await db.run(
            'INSERT INTO history (user_id, action_type, note, created_at) VALUES (?, ?, ?, ?)',
            [req.user.id, 'DONE', note || null, Date.now()]
        );

        res.json({ message: "Turno completato!" });
    } catch (error) {
        console.error("[ERR] Done:", error);
        res.status(500).json({ error: "Errore server" });
    }
});

// 3. POST /action/skip - Logica anti-loop
router.post('/action/skip', async (req, res) => {
    try {
        const { note } = req.body;
        const db = await getDB();
        const now = Date.now();

        const fullQueue = await db.all(`
            SELECT id, user_id, order_num, last_skipped 
            FROM queue 
            ORDER BY order_num ASC
        `);

        if (fullQueue.length < 2) {
            return res.status(400).json({ error: "Nessuno con cui scambiare!" });
        }

        const absentUser = fullQueue[0];

        const COOLDOWN_MS = 30 * 60 * 1000; // 30min
        let target = null;

        for (let i = 1; i < fullQueue.length; i++) {
            const candidate = fullQueue[i];
            const isRecentlySkipped = candidate.last_skipped && (now - candidate.last_skipped < COOLDOWN_MS);

            if (!isRecentlySkipped) {
                target = candidate;
                break; 
            }
        }

        if (!target) {return res.status(400).json({ error: "Nessuno è presente, la coda è invariata" });}

        await db.run('UPDATE queue SET order_num = order_num + 1 WHERE order_num < ?', [target.order_num]);
        await db.run('UPDATE queue SET order_num = 1 WHERE id = ?', [target.id]);
        await db.run('UPDATE queue SET last_skipped = ? WHERE id = ?', [now, absentUser.id]);
        await normalizeQueue(db);

        await db.run(
            'INSERT INTO history (user_id, action_type, note, created_at) VALUES (?, ?, ?, ?)',
            [absentUser.user_id, 'SKIP', note || "Salto turno", now]
        );

        res.json({ message: `Assenza segnalata. ${target.user_id} passa in cima.` });

    } catch (error) {
        console.error("[ERR] Skip:", error);
        res.status(500).json({ error: "Errore server" });
    }
});

module.exports = router;