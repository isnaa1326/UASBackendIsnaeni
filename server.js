const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================
app.use(cors({
  origin: true, // izinkan semua origin (development)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==================== ROUTES ====================
const authRoutes    = require('./routes/auth');
const productRoutes = require('./routes/products');
const kotaRoutes    = require('./routes/kota');
const orderRoutes   = require('./routes/orders');

app.use('/api/auth',     authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/kota',     kotaRoutes);
app.use('/api/orders',   orderRoutes);

// ==================== ROOT ====================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🛍️ UrbanStore API berjalan!',
    version: '1.0.0',
    endpoints: {
      auth:     '/api/auth',
      products: '/api/products',
      kota:     '/api/kota',
      orders:   '/api/orders'
    }
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.url} tidak ditemukan.`
  });
});

// ==================== ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Terjadi kesalahan internal server.'
  });
});

// ==================== START ====================
const initDatabase = require('./config/init-db');

initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 UrbanStore API berjalan di http://localhost:${PORT}`);
    console.log(`📋 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

module.exports = app;
