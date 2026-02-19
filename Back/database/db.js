const mysql = require('mysql2/promise');

let dbPool = null;

async function getDB() {
    if (dbPool) return dbPool;

    dbPool = mysql.createPool({
        uri: process.env.DATABASE_URL, 
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });

    await dbPool.execute(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            salt VARCHAR(255) NOT NULL,
            token VARCHAR(255),
            is_on_vacation TINYINT DEFAULT 0
        );
    `);

    await dbPool.execute(`
        CREATE TABLE IF NOT EXISTS queue (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            order_num INT,
            last_skipped BIGINT,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    await dbPool.execute(`
        CREATE TABLE IF NOT EXISTS history (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT,
            action_type VARCHAR(50),
            note TEXT,
            created_at BIGINT,
            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
        );
    `);

    console.log("Database MySQL (Aiven) collegato con successo!");
    return dbPool;
}

module.exports = { getDB };