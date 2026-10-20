
const express = require('express');

const supplierController = require('../controllers/supplier.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validateSupplier } = require('../validators/supplier.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', supplierController.getSuppliers);

router.get('/:id', supplierController.getSupplierById);

router.post(
    '/',
    validateSupplier,
    supplierController.createSupplier
);

router.put(
    '/:id',
    validateSupplier,
    supplierController.updateSupplier
);

router.delete('/:id', supplierController.deleteSupplier);

module.exports = router;
