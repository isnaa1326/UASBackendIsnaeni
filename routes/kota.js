const express = require('express');
const router = express.Router();
const kotaController = require('../controllers/kotaController');

// GET /api/kota              - ambil semua kota dan ongkir (public)
router.get('/', kotaController.getAllKota);

// GET /api/kota/ongkir?kota_id=1&berat=1500  - hitung ongkir (public)
router.get('/ongkir', kotaController.hitungOngkir);

module.exports = router;
