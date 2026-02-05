const { getDB } = require('../database/db');

const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        
        if (!token) {
            return res.status(401).json({ error: "Accesso negato. Token mancante." });
        }

        const db = await getDB();
        const user = await db.get('SELECT * FROM users WHERE token = ?', [token]);

        if (!user) {
            return res.status(403).json({ error: "Token non valido o scaduto." });
        }

        req.user = user;
        
        next();

    } catch (error) {
        console.error("Errore Middleware:", error);
        res.status(500).json({ error: "Errore controllo auth" });
    }
};

module.exports = requireAuth;