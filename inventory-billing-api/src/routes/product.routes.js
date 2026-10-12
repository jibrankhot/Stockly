
const express = require('express');

const productController = require('../controllers/product.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
    validateProduct,
    validateProductId
} = require('../validators/product.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', productController.getProducts);

router.get(
    '/:id',
    validateProductId,
    productController.getProductById
);

router.post(
    '/',
    validateProduct,
    productController.createProduct
);

router.put(
    '/:id',
    validateProductId,
    validateProduct,
    productController.updateProduct
);

router.delete(
    '/:id',
    validateProductId,
    productController.deleteProduct
);

module.exports = router;
