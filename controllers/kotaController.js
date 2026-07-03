const db = require('../config/database');

// GET semua kota beserta ongkir
exports.getAllKota = async (req, res) => {
  try {
    const [kota] = await db.query(
      'SELECT * FROM kota ORDER BY nama ASC'
    );

    res.json({
      success: true,
      data: kota
    });
  } catch (error) {
    console.error('Error get kota:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};

// GET hitung ongkir berdasarkan kotaId dan berat (gram)
exports.hitungOngkir = async (req, res) => {
  try {
    const { kota_id, berat } = req.query;

    if (!kota_id || !berat) {
      return res.status(400).json({
        success: false,
        message: 'kota_id dan berat (gram) wajib diisi.'
      });
    }

    const [kota] = await db.query(
      'SELECT * FROM kota WHERE id = ?',
      [kota_id]
    );

    if (kota.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Kota tidak ditemukan.'
      });
    }

    const beratKg = Math.ceil(parseInt(berat) / 1000);
    const ongkir = kota[0].ongkir * beratKg;

    res.json({
      success: true,
      data: {
        kota: kota[0].nama,
        berat_gram: parseInt(berat),
        berat_kg: beratKg,
        ongkir_per_kg: kota[0].ongkir,
        total_ongkir: ongkir
      }
    });
  } catch (error) {
    console.error('Error hitung ongkir:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan server.'
    });
  }
};
