const mysql = require('mysql2');
require('dotenv').config();

const host = process.env.MYSQLHOST || process.env.DB_HOST || 'localhost';
const port = process.env.MYSQLPORT || process.env.DB_PORT || 3306;
const user = process.env.MYSQLUSER || process.env.DB_USER || 'root';
const database = process.env.MYSQLDATABASE || process.env.DB_NAME || 'urbanstore_db';

console.log(`ℹ️ Mencoba koneksi database ke: mysql://${user}@${host}:${port}/${database}`);

const pool = mysql.createPool({
  host,
  port,
  user,
  password: process.env.MYSQLPASSWORD || process.env.DB_PASSWORD || '',
  database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const db = pool.promise();

// Test koneksi
pool.getConnection((err, connection) => {
  if (err) {
    console.error('❌ Gagal koneksi ke database:', err);
    return;
  }
  console.log('✅ Koneksi database berhasil');
  connection.release();
});

module.exports = db;
