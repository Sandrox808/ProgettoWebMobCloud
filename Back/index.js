const express = require('express');
const { getDB } = require('./database/db');

const app = express();
const port = 3000;

app.use(express.json());

app.listen(port, async () => {
    console.log(`Server attivo su http://localhost:${port}`);
    
    try {
        await getDB();
    } catch (error) {
        console.error("Errore durante l'inizializzazione del DB:", error);
    }
});