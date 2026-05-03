const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken } = require('../middleware/authMiddleware');

// Защита обоих маршрутов: оформлять и смотреть заказы могут только авторизованные
router.post('/', verifyToken, orderController.createOrder);
router.get('/my-orders', verifyToken, orderController.getMyOrders);

module.exports = router;