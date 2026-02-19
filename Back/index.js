require('dotenv').config();
const express = require('express');
const { getDB } = require('./database/db');

const authRoutes = require('./routes/auth');
const queueRoutes = require('./routes/queue');
const historyRoutes = require('./routes/history');
const statsRoutes = require('./routes/stats');
const userRoutes = require('./routes/user');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(authRoutes);
app.use(queueRoutes);
app.use(historyRoutes);
app.use(statsRoutes);
app.use(userRoutes);

app.listen(port, '0.0.0.0', async () => {
    console.log(`Server attivo su http://localhost:${port}`);
    try {
        await getDB();
    } catch (error) {
        console.error("Errore DB:", error);
    }
});