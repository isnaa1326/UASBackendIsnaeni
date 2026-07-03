// Script untuk reset password admin
// Jalankan: node reset-admin.js

const bcrypt = require('bcryptjs');
const db = require('./config/database');
require('dotenv').config();

async function resetAdmin() {
  try {
    const password = 'admin123';
    const hash = await bcrypt.hash(password, 10);
    
    // Cek apakah admin sudah ada
    const [existing] = await db.query(
      'SELECT id, email, role FROM users WHERE email = ?',
      ['admin@urbanstore.com']
    );

    if (existing.length > 0) {
      // Update password dan pastikan role = admin
      await db.query(
        'UPDATE users SET password = ?, role = ? WHERE email = ?',
        [hash, 'admin', 'admin@urbanstore.com']
      );
      console.log('✅ Password admin berhasil direset!');
      console.log('📧 Email   : admin@urbanstore.com');
      console.log('🔑 Password: admin123');
      console.log('👤 Role    : admin');
    } else {
      // Buat akun admin baru
      await db.query(
        'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
        ['Admin UrbanStore', 'admin@urbanstore.com', hash, 'admin']
      );
      console.log('✅ Akun admin berhasil dibuat!');
      console.log('📧 Email   : admin@urbanstore.com');
      console.log('🔑 Password: admin123');
    }

    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

resetAdmin();
