const express = require('express');
const router = express.Router();
const { getDB } = require('../database/db');
const requireAuth = require('../middleware/authMiddleware');

router.get('/queue', requireAuth, async (req, res) => {
    res.json({ message: "Qui ci sarà la lista della coda" });
});

module.exports = router;