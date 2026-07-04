const fs = require('fs');
const path = require('path');
const db = require('./config/database');

async function setupDatabase() {
  try {
    console.log('🔄 Memulai inisialisasi database...');
    
    // Baca file SQL
    const sqlPath = path.join(__dirname, 'urbanstore.sql');
    if (!fs.existsSync(sqlPath)) {
      throw new Error(`File SQL tidak ditemukan di: ${sqlPath}`);
    }
    
    let sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // Bersihkan komentar single-line (-- dan #)
    sqlContent = sqlContent.replace(/--.*$/gm, '').replace(/#.*$/gm, '');

    // Bersihkan komentar block (/* */)
    sqlContent = sqlContent.replace(/\/\*[\s\S]*?\*\//g, '');

    // Bersihkan query dari CREATE DATABASE dan USE agar berjalan pada database yang sudah disediakan Railway/XAMPP
    sqlContent = sqlContent
      .replace(/DROP DATABASE IF EXISTS[^;]+;/gi, '')
      .replace(/CREATE DATABASE[^;]+;/gi, '')
      .replace(/USE [^;]+;/gi, '');

    // Split SQL menjadi command-command individu berdasarkan titik koma (;)
    const queries = sqlContent
      .split(';')
      .map(q => q.trim())
      .filter(q => q.length > 0);

    console.log(`📋 Ditemukan ${queries.length} query untuk dieksekusi.`);

    // Matikan check foreign key sementara
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      try {
        await db.query(query);
        console.log(`✅ Berhasil mengeksekusi query ke-${i + 1}/${queries.length}`);
      } catch (err) {
        console.error(`❌ Gagal mengeksekusi query ke-${i + 1}:`);
        console.error(query);
        console.error(`Detail error: ${err.message}`);
        throw err;
      }
    }

    // Hidupkan kembali check foreign key
    await db.query('SET FOREIGN_KEY_CHECKS = 1;');
    console.log('✅ Inisialisasi database berhasil selesai!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Terjadi kesalahan saat inisialisasi database:', error.message);
    process.exit(1);
  }
}

// Jalankan script
setupDatabase();
