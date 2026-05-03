const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/authMiddleware');

// Применение защиты ко всем маршрутам в этом файле
router.use(verifyToken, verifyAdmin);

// Маршруты для фермерских заявок
router.get('/farms/pending', adminController.getPendingFarms);
router.put('/farms/:id/verify', adminController.verifyFarm);

// Маршруты для отзывов
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);

module.exports = router;