
const isOptionalString = (value) =>
    value === undefined || value === null || typeof value === 'string';

const isValidEmail = (value) => {
    if (value === undefined || value === null || value === '') {
        return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const validateSupplier = (req, res, next) => {
    const body = req.body || {};
    const isCreating = req.method === 'POST';

    const fail = (message) =>
        res.status(422).json({
            success: false,
            message
        });

    // Supplier code is required when creating a supplier.
    const code = body.code ?? body.supplierCode;

    if (
        isCreating &&
        (typeof code !== 'string' || !code.trim())
    ) {
        return fail('Supplier code is required');
    }

    if (code !== undefined && code !== null) {
        if (typeof code !== 'string') {
            return fail('Supplier code must be a string');
        }

        if (code.trim().length > 100) {
            return fail('Supplier code must not exceed 100 characters');
        }
    }

    if (
        isCreating &&
        (typeof body.name !== 'string' || !body.name.trim())
    ) {
        return fail('Supplier name is required');
    }

    if (
        body.name !== undefined &&
        (typeof body.name !== 'string' || !body.name.trim())
    ) {
        return fail('Supplier name must be a non-empty string');
    }

    if (
        typeof body.name === 'string' &&
        body.name.length > 200
    ) {
        return fail('Supplier name must not exceed 200 characters');
    }

    const stringFields = [
        { key: 'email', label: 'Email', max: 255 },
        { key: 'phone', label: 'Phone', max: 30 },
        { key: 'city', label: 'City', max: 100 },
        { key: 'state', label: 'State', max: 100 },
        { key: 'postalCode', label: 'Postal code', max: 20 },
        { key: 'taxNumber', label: 'Tax number', max: 100 }
    ];

    for (const field of stringFields) {
        const value = body[field.key];

        if (!isOptionalString(value)) {
            return fail(`${field.label} must be a string`);
        }

        if (
            typeof value === 'string' &&
            value.length > field.max
        ) {
            return fail(
                `${field.label} must not exceed ${field.max} characters`
            );
        }
    }

    if (body.address !== undefined && body.address !== null &&
        typeof body.address !== 'string') {
        return fail('Address must be a string');
    }

    if (!isValidEmail(body.email)) {
        return fail('Please provide a valid email address');
    }

    if (
        body.isActive !== undefined &&
        typeof body.isActive !== 'boolean'
    ) {
        return fail('isActive must be a boolean');
    }

    next();
};

module.exports = {
    validateSupplier
};
