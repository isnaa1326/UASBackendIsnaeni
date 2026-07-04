const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// POST /api/auth/register
router.post('/register', authController.register);

// POST /api/auth/login
router.post('/login', authController.login);

// GET /api/auth/profile (perlu login)
router.get('/profile', verifyToken, authController.getProfile);

// GET /api/auth/users (admin)
router.get('/users', verifyAdmin, authController.getAllUsers);

module.exports = router;
