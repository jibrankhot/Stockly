
const express = require('express');

const customerController = require('../controllers/customer.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
    validateCustomer,
    validateCustomerImport
} = require('../validators/customer.validator');

const router = express.Router();

router.use(authenticate);

router.get('/', customerController.getCustomers);

router.post(
    '/import',
    validateCustomerImport,
    customerController.importCustomers
);

router.get('/:id', customerController.getCustomerById);

router.post(
    '/',
    validateCustomer,
    customerController.createCustomer
);

router.put(
    '/:id',
    validateCustomer,
    customerController.updateCustomer
);

router.delete(
    '/:id',
    customerController.deleteCustomer
);

module.exports = router;
