const express = require('express');

const authController = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const {
    validateLogin,
    validateForgotPassword,
    validateResetPassword
} = require('../validators/auth.validator');

const router = express.Router();

router.post(
    '/login',
    validateLogin,
    authController.login
);

router.post(
    '/forgot-password',
    validateForgotPassword,
    authController.forgotPassword
);

router.post(
    '/reset-password',
    validateResetPassword,
    authController.resetPassword
);

router.get(
    '/me',
    authenticate,
    authController.me
);

module.exports = router;