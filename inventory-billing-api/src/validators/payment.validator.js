
const validatePayment = (req, res, next) => {
    const {
        invoiceId,
        paymentDate,
        amount,
        paymentMethod,
        referenceNumber,
        notes
    } = req.body;

    const errors = [];

    const parsedInvoiceId = Number(invoiceId);
    if (
        invoiceId === undefined ||
        invoiceId === null ||
        invoiceId === '' ||
        !Number.isSafeInteger(parsedInvoiceId) ||
        parsedInvoiceId <= 0
    ) {
        errors.push('Invoice ID must be a positive integer');
    }

    if (paymentDate !== undefined && paymentDate !== null && paymentDate !== '') {
        if (
            typeof paymentDate !== 'string' ||
            !/^\d{4}-\d{2}-\d{2}$/.test(paymentDate)
        ) {
            errors.push('Payment date must use YYYY-MM-DD format');
        } else {
            const date = new Date(`${paymentDate}T00:00:00Z`);
            if (
                Number.isNaN(date.getTime()) ||
                date.toISOString().slice(0, 10) !== paymentDate
            ) {
                errors.push('Payment date must be a valid calendar date');
            }
        }
    }

    const parsedAmount = Number(amount);
    if (
        amount === undefined ||
        amount === null ||
        amount === '' ||
        !Number.isFinite(parsedAmount) ||
        parsedAmount <= 0 ||
        !/^\d+(\.\d{1,2})?$/.test(String(amount).trim())
    ) {
        errors.push('Payment amount must be greater than zero with at most two decimal places');
    }

    const allowedMethods = [
        'Cash',
        'Card',
        'UPI',
        'Bank Transfer',
        'Cheque',
        'Other'
    ];

    const normalizedMethod = String(paymentMethod || '')
        .trim()
        .toLowerCase();

    const methodMap = {
        cash: 'Cash',
        card: 'Card',
        upi: 'UPI',
        'bank transfer': 'Bank Transfer',
        bank_transfer: 'Bank Transfer',
        cheque: 'Cheque',
        other: 'Other'
    };

    if (!methodMap[normalizedMethod]) {
        errors.push(`Payment method must be one of: ${allowedMethods.join(', ')}`);
    }

    if (
        referenceNumber !== undefined &&
        referenceNumber !== null &&
        (typeof referenceNumber !== 'string' || referenceNumber.length > 255)
    ) {
        errors.push('Reference number must be a string of at most 255 characters');
    }

    if (
        notes !== undefined &&
        notes !== null &&
        typeof notes !== 'string'
    ) {
        errors.push('Notes must be a string');
    }

    if (errors.length > 0) {
        return res.status(422).json({
            message: 'Validation failed',
            errors
        });
    }

    req.body.invoiceId = parsedInvoiceId;
    req.body.amount = parsedAmount;
    req.body.paymentMethod = methodMap[normalizedMethod];

    if (paymentDate === '') {
        req.body.paymentDate = undefined;
    }

    next();
};

module.exports = { validatePayment };
