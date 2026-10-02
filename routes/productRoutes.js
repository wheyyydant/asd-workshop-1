const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { cacheMiddleware } = require('../middleware/cacheMiddleware');

// Route → Middleware → Controller → Service → Database

// GET endpoints with cache middleware
router.get('/', cacheMiddleware, (req, res) => productController.getAllProducts(req, res));
router.get('/:id', cacheMiddleware, (req, res) => productController.getProductById(req, res));

// Mutation endpoints (POST, PUT, PATCH, DELETE) - cache invalidated in controller
router.post('/', (req, res) => productController.createProduct(req, res));
router.put('/:id', (req, res) => productController.updateProduct(req, res));
router.patch('/:id', (req, res) => productController.updateProduct(req, res));
router.delete('/:id', (req, res) => productController.deleteProduct(req, res));

module.exports = router;
