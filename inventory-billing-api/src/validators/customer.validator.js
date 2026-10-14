
const MAX_IMPORT_ROWS = 500;

const validateCustomer = (req, res, next) => {
    const body = req.body || {};

    if (
        req.method === 'POST' &&
        (
            !body.name ||
            typeof body.name !== 'string' ||
            !body.name.trim()
        )
    ) {
        return res.status(422).json({
            success: false,
            message: 'Customer name is required'
        });
    }

    if (
        body.name !== undefined &&
        typeof body.name !== 'string'
    ) {
        return res.status(422).json({
            success: false,
            message: 'Customer name must be a string'
        });
    }

    if (
        body.email !== undefined &&
        body.email !== null &&
        body.email !== '' &&
        typeof body.email !== 'string'
    ) {
        return res.status(422).json({
            success: false,
            message: 'Email must be a string'
        });
    }

    if (
        body.creditLimit !== undefined &&
        (
            Number.isNaN(Number(body.creditLimit)) ||
            Number(body.creditLimit) < 0
        )
    ) {
        return res.status(422).json({
            success: false,
            message: 'Credit limit must be a non-negative number'
        });
    }

    if (
        body.isActive !== undefined &&
        typeof body.isActive !== 'boolean'
    ) {
        return res.status(422).json({
            success: false,
            message: 'isActive must be a boolean'
        });
    }

    return next();
};

const validateCustomerImport = (req, res, next) => {
    const body = req.body;

    if (
        !body ||
        typeof body !== 'object' ||
        !Array.isArray(body.customers)
    ) {
        return res.status(422).json({
            success: false,
            message: 'Request body must contain a customers array'
        });
    }

    if (body.customers.length === 0) {
        return res.status(422).json({
            success: false,
            message: 'Add at least one customer to import'
        });
    }

    if (body.customers.length > MAX_IMPORT_ROWS) {
        return res.status(422).json({
            success: false,
            message: `A maximum of ${MAX_IMPORT_ROWS} customers can be imported at a time`
        });
    }

    return next();
};

module.exports = {
    validateCustomer,
    validateCustomerImport
};
