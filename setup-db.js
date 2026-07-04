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
    
    // Bersihkan query dari CREATE DATABASE dan USE agar berjalan pada database yang sudah disediakan Railway/XAMPP
    sqlContent = sqlContent
      .replace(/DROP DATABASE IF EXISTS[^;]+;/gi, '')
      .replace(/CREATE DATABASE[^;]+;/gi, '')
      .replace(/USE [^;]+;/gi, '');

    // Split SQL menjadi command-command individu berdasarkan titik koma (;)
    // Tapi hati-hati agar tidak memecah isi string yang mengandung titik koma.
    // Metode sederhana yang umum: split dengan ;\r\n atau ;\n
    const queries = sqlContent
      .split(/;[ \t]*[\r\n]+/g)
      .map(q => q.trim())
      .filter(q => q.length > 0 && !q.startsWith('--'));

    console.log(`📋 Ditemukan ${queries.length} query untuk dieksekusi.`);

    // Matikan check foreign key sementara
    await db.query('SET FOREIGN_KEY_CHECKS = 0;');

    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      // Lewati komentar penuh
      if (query.startsWith('--') || query.startsWith('/*')) continue;
      
      try {
        await db.query(query);
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
