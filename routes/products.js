const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyAdmin } = require('../middleware/auth');

// GET /api/products           - ambil semua produk (public, bisa ?search=&category=)
router.get('/', productController.getAllProducts);

// GET /api/products/categories - ambil semua kategori (public)
router.get('/categories', productController.getCategories);

// GET /api/products/:id       - ambil produk by id (public)
router.get('/:id', productController.getProductById);

// POST /api/products          - tambah produk (admin)
router.post('/', verifyAdmin, productController.createProduct);

// PUT /api/products/:id       - update produk (admin)
router.put('/:id', verifyAdmin, productController.updateProduct);

// DELETE /api/products/:id    - hapus produk (admin)
router.delete('/:id', verifyAdmin, productController.deleteProduct);

module.exports = router;
