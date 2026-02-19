const express = require('express');
const router = express.Router();
const { getDB } = require('../database/db');
const requireAuth = require('../middleware/authMiddleware');

router.use(requireAuth);

// GET /stats
// Restituisce: Champ (chi lava di più), Athlete (chi salta di più), MyStats (i miei dati)
router.get('/stats', async (req, res) => {
    try {
        const db = await getDB();

        const now = new Date();
        let targetMonth = req.query.month ? parseInt(req.query.month) - 1 : now.getMonth();
        let targetYear = req.query.year ? parseInt(req.query.year) : now.getFullYear();

        const startOfMonth = new Date(targetYear, targetMonth, 1).getTime();
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59).getTime();

        const [champRows] = await db.execute(`
            SELECT u.username, COUNT(h.id) as count
            FROM history h
            JOIN users u ON h.user_id = u.id
            WHERE h.action_type = 'DONE' 
              AND h.created_at BETWEEN ? AND ?
            GROUP BY h.user_id
            ORDER BY count DESC
            LIMIT 1
        `, [startOfMonth, endOfMonth]);
        const champ = champRows[0];

        const [athleteRows] = await db.execute(`
            SELECT u.username, COUNT(h.id) as count
            FROM history h
            JOIN users u ON h.user_id = u.id
            WHERE h.action_type = 'SKIP' 
              AND h.created_at BETWEEN ? AND ?
            GROUP BY h.user_id
            ORDER BY count DESC
            LIMIT 1
        `, [startOfMonth, endOfMonth]);
        const athlete = athleteRows[0];

        const [myDonesRows] = await db.execute(`
            SELECT COUNT(id) as count FROM history 
            WHERE user_id = ? AND action_type = 'DONE' AND created_at BETWEEN ? AND ?
        `, [req.user.id, startOfMonth, endOfMonth]);
        const myDonesResult = myDonesRows[0];
        const myDones = myDonesResult ? myDonesResult.count : 0;

        const [totalDonesRows] = await db.execute(`
            SELECT COUNT(id) as count FROM history 
            WHERE action_type = 'DONE' AND created_at BETWEEN ? AND ?
        `, [startOfMonth, endOfMonth]);
        const totalDonesResult = totalDonesRows[0];
        const totalDones = totalDonesResult ? totalDonesResult.count : 0;

        let percentage = 0;
        if (totalDones > 0) {
            percentage = Math.round((myDones / totalDones) * 100);
        }

        res.json({
            period: { month: targetMonth + 1, year: targetYear },
            champ: champ || { username: "Nessuno", count: 0 },
            athlete: athlete || { username: "Nessuno", count: 0 },
            me: {
                dones: myDones,
                percentage: `${percentage}%`
            }
        });

    } catch (error) {
        console.error("[ERR] Stats:", error);
        res.status(500).json({ error: "Errore server" });
    }
});

module.exports = router;