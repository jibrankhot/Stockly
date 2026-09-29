
const validateSupplier = (req, res, next) => {
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
            message: 'Supplier name is required'
        });
    }

    if (
        body.name !== undefined &&
        (
            typeof body.name !== 'string' ||
            !body.name.trim()
        )
    ) {
        return res.status(422).json({
            success: false,
            message: 'Supplier name must be a non-empty string'
        });
    }

    if (
        body.code !== undefined &&
        body.code !== null &&
        typeof body.code !== 'string'
    ) {
        return res.status(422).json({
            success: false,
            message: 'Supplier code must be a string'
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
        body.isActive !== undefined &&
        typeof body.isActive !== 'boolean'
    ) {
        return res.status(422).json({
            success: false,
            message: 'isActive must be a boolean'
        });
    }

    next();
};

module.exports = {
    validateSupplier
};