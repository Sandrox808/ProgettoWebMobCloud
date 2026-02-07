const express = require('express');
const router = express.Router();
const { getDB } = require('../database/db');
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth);

// POST /user/toggle-vacation
// Body: { status: true/false } (true = vado in vacanza)
router.post('/user/toggle-vacation', async (req, res) => {
    try {
        const { status } = req.body;
        const db = await getDB();
        
        const vacationValue = status ? 1 : 0;

        await db.run('UPDATE users SET is_on_vacation = ? WHERE id = ?', 
            [vacationValue, req.user.id]);

        const msg = status ? "Buone vacanze!" : "Bentornato/a! Si lavora!";
        
        await db.run(
            'INSERT INTO history (user_id, action_type, note, created_at) VALUES (?, ?, ?, ?)',
            [req.user.id, 'STATUS', msg, Date.now()]
        );

        res.json({ message: msg, is_on_vacation: status });

    } catch (error) {
        console.error("[ERR] Toggle Vacation:", error);
        res.status(500).json({ error: "Errore server" });
    }
});

module.exports = router;