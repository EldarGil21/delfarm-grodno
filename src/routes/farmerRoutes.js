const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/public-list', farmerController.getPublicFarms);

router.get('/dashboard', verifyToken, farmerController.getDashboardStats);

router.get('/products', verifyToken, farmerController.getProducts);
router.post('/products', verifyToken, farmerController.addProduct);
router.put('/products/:id', verifyToken, farmerController.updateProduct);
router.delete('/products/:id', verifyToken, farmerController.deleteProduct);

router.get('/orders', verifyToken, farmerController.getFarmerOrders);
router.put('/orders/:id/status', verifyToken, farmerController.updateOrderStatus);

module.exports = router;