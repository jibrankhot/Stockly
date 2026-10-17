
const asyncHandler = require('../utils/async-handler');
const paymentService = require('../services/payment.service');

const parsePaymentId = (value) => {
    const id = Number(value);

    if (!Number.isSafeInteger(id) || id <= 0) {
        const error = new Error('Invalid payment ID');
        error.statusCode = 400;
        throw error;
    }

    return id;
};

const getPayments = asyncHandler(async (req, res) => {
    const payments = await paymentService.getPayments();

    res.status(200).json(payments);
});

const getPaymentById = asyncHandler(async (req, res) => {
    const id = parsePaymentId(req.params.id);
    const payment = await paymentService.getPaymentById(id);

    res.status(200).json(payment);
});

const createPayment = asyncHandler(async (req, res) => {
    const userId = req.user?.id ?? req.user?.userId ?? null;

    const payment = await paymentService.createPayment(
        req.body,
        userId
    );

    res.status(201).json(payment);
});

const deletePayment = asyncHandler(async (req, res) => {
    const id = parsePaymentId(req.params.id);
    const result = await paymentService.deletePayment(id);

    res.status(200).json(result);
});

module.exports = {
    getPayments,
    getPaymentById,
    createPayment,
    deletePayment
};
