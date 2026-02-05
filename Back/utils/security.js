const crypto = require('crypto');

const DB_SECRET = process.env.DB_SECRET || "StringaDiFallback"; 

/**
 * Crea l'hash MD5 secondo la specifica richiesta:
 * MD5(password + Secret + Salt)
 */
function hashPassword(password, userSalt) {
    const hash = crypto.createHash('md5');
    const data = password + DB_SECRET + userSalt;
    return hash.update(data).digest('hex');
}

/**
 * Genera una stringa casuale esadecimale.
 * Utile per generare il Salt e il Token di sessione.
 * Default: 16 byte (32 caratteri).
 */
function generateRandomString(length = 16) {
    return crypto.randomBytes(length).toString('hex');
}

module.exports = { hashPassword, generateRandomString };