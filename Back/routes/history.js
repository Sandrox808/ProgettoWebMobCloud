const express = require('express');
const router = express.Router();
const { getDB } = require('../database/db');
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth);

// GET /history
// Parametri opzionali: ?month=2&year=2026
// Se non specificati, prende mese e anno correnti.
router.get('/history', async (req, res) => {
    try {
        const db = await getDB();
        
        const now = new Date();
        
        let targetMonth = req.query.month ? parseInt(req.query.month) - 1 : now.getMonth();
        let targetYear = req.query.year ? parseInt(req.query.year) : now.getFullYear();

        const startOfMonth = new Date(targetYear, targetMonth, 1).getTime();
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59).getTime();

        const history = await db.all(`
            SELECT h.id, u.username, h.action_type, h.note, h.created_at
            FROM history h
            JOIN users u ON h.user_id = u.id
            WHERE h.created_at BETWEEN ? AND ?
            ORDER BY h.created_at DESC
        `, [startOfMonth, endOfMonth]);

        const formattedHistory = history.map(entry => ({
            ...entry,
            date_iso: new Date(entry.created_at).toISOString()
        }));

        res.json({ 
            month: targetMonth + 1,
            year: targetYear,
            history: formattedHistory 
        });

    } catch (error) {
        console.error("[ERR] History:", error);
        res.status(500).json({ error: "Errore server" });
    }
});

module.exports = router;