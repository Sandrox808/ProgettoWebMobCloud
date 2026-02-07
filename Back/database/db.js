const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const fs = require('fs');
const path = require('path');

let dbInstance = null;

async function getDB() {
    if (dbInstance) return dbInstance;

    const dbPath = path.join(__dirname, 'turni.sqlite');
    const dbFolder = path.dirname(dbPath);

    if (!fs.existsSync(dbFolder)) {
        fs.mkdirSync(dbFolder, { recursive: true });
    }

    const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
    });

    await db.exec('PRAGMA foreign_keys = ON;');

    await db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            salt TEXT NOT NULL,
            token TEXT
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS queue (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            order_num INTEGER,
            last_skipped INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    await db.exec(`
        CREATE TABLE IF NOT EXISTS history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            action_type TEXT,
            note TEXT,
            created_at INTEGER,
            FOREIGN KEY(user_id) REFERENCES users(id)
        );
    `);

    dbInstance = db;
    console.log("Database SQLite collegato.");
    return dbInstance;
}

module.exports = { getDB };