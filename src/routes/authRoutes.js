const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

// Обновление профиля (доступен только авторизованным)
router.put('/profile', verifyToken, authController.updateProfile);

module.exports = router;