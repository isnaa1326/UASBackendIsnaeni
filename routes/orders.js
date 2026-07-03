const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// POST /api/orders           - buat order baru / checkout (perlu login)
router.post('/', verifyToken, orderController.createOrder);

// GET /api/orders/my         - riwayat order user sendiri (perlu login)
router.get('/my', verifyToken, orderController.getMyOrders);

// GET /api/orders            - semua order (admin)
router.get('/', verifyAdmin, orderController.getAllOrders);

// PUT /api/orders/:id/status - update status order (admin)
router.put('/:id/status', verifyAdmin, orderController.updateOrderStatus);

module.exports = router;
