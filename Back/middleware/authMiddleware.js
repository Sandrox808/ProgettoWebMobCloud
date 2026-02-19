const { getDB } = require('../database/db');

const requireAuth = async (req, res, next) => {
    try {
        const token = req.headers['authorization'];
        
        if (!token) {
            return res.status(401).json({ error: "Accesso negato. Token mancante." });
        }

        const db = await getDB();
        // MySQL restituisce [rows, fields]
        const [rows] = await db.execute('SELECT * FROM users WHERE token = ?', [token]);

        // Se l'array è vuoto, il token non esiste
        if (rows.length === 0) {
            return res.status(403).json({ error: "Token non valido o scaduto." });
        }

        // rows[0] contiene i dati dell'utente
        req.user = rows[0];
        
        next();

    } catch (error) {
        console.error("Errore Middleware:", error);
        res.status(500).json({ error: "Errore controllo auth" });
    }
};

module.exports = requireAuth;