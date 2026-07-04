const fs = require('fs');
const path = require('path');
const db = require('./database');
const bcrypt = require('bcryptjs');

async function initDatabase() {
  try {
    console.log('🔄 Memeriksa tabel database...');
    // Cek apakah tabel users sudah ada
    const [tables] = await db.query("SHOW TABLES LIKE 'users';");
    
    let dbAlreadyInitialized = tables.length > 0;
    
    if (!dbAlreadyInitialized) {
      console.log('⚠️ Database kosong! Memulai inisialisasi skema database...');
      
      const sqlPath = path.join(__dirname, '..', 'urbanstore.sql');
      if (!fs.existsSync(sqlPath)) {
        console.warn(`⚠️ File urbanstore.sql tidak ditemukan di: ${sqlPath}`);
        return;
      }
      
      let sqlContent = fs.readFileSync(sqlPath, 'utf8');
      
      // Bersihkan komentar single-line (-- dan #)
      sqlContent = sqlContent.replace(/--.*$/gm, '').replace(/#.*$/gm, '');

      // Bersihkan komentar block (/* */)
      sqlContent = sqlContent.replace(/\/\*[\s\S]*?\*\//g, '');
      
      // Bersihkan query dari CREATE DATABASE dan USE
      sqlContent = sqlContent
        .replace(/DROP DATABASE IF EXISTS[^;]+;/gi, '')
        .replace(/CREATE DATABASE[^;]+;/gi, '')
        .replace(/USE [^;]+;/gi, '');

      const queries = sqlContent
        .split(';')
        .map(q => q.trim())
        .filter(q => q.length > 0);

      console.log(`📋 Menjalankan ${queries.length} query inisialisasi...`);

      // Matikan check foreign key sementara
      await db.query('SET FOREIGN_KEY_CHECKS = 0;');

      for (let i = 0; i < queries.length; i++) {
        await db.query(queries[i]);
        console.log(`✅ Berhasil mengeksekusi query ke-${i + 1}/${queries.length}`);
      }

      // Hidupkan kembali check foreign key
      await db.query('SET FOREIGN_KEY_CHECKS = 1;');
    } else {
      console.log('✅ Tabel database sudah ada. Melewati inisialisasi skema.');
    }

    // Pastikan akun admin default selalu ada
    const [existingAdmin] = await db.query(
      'SELECT id FROM users WHERE email = ?',
      ['admin@urbanstore.com']
    );

    if (existingAdmin.length === 0) {
      console.log('🔄 Membuat akun admin default...');
      const adminHash = await bcrypt.hash('admin123', 10);
      await db.query(
        'INSERT INTO users (name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())',
        ['Admin UrbanStore', 'admin@urbanstore.com', adminHash, 'admin']
      );
      console.log('✅ Akun admin default (admin@urbanstore.com / admin123) berhasil dibuat!');
    } else {
      console.log('✅ Akun admin default sudah terdaftar.');
    }

    console.log('✅ Inisialisasi database berhasil selesai!');
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat memeriksa/inisialisasi database:', error);
  }
}

module.exports = initDatabase;
