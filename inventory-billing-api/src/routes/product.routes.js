const express = require('express');

const productController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateProduct } = require('../validators/product.validator');

const router = express.Router();

router.use(authenticate);

router.get(
    '/',
    productController.getProducts
);

router.get(
    '/:id',
    productController.getProductById
);

router.post(
    '/',
    validateProduct,
    productController.createProduct
);

router.put(
    '/:id',
    validateProduct,
    productController.updateProduct
);

router.delete(
    '/:id',
    productController.deleteProduct
);

module.exports = router;