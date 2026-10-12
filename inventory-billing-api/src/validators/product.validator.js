
const allowedFields = new Set([
    'sku',
    'name',
    'description',
    'categoryId',
    'unit',
    'purchasePrice',
    'sellingPrice',
    'taxRate',
    'currentStock',
    'minimumStock',
    'isActive'
]);

const numericFields = [
    'purchasePrice',
    'sellingPrice',
    'taxRate',
    'currentStock',
    'minimumStock'
];

const numericLimits = {
    purchasePrice: 9999999999.99,
    sellingPrice: 9999999999.99,
    taxRate: 100,
    currentStock: 9999999999.99,
    minimumStock: 9999999999.99
};

const validateProductId = (req, res, next) => {
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        return res.status(400).json({
            success: false,
            message: 'Product ID must be a valid positive integer'
        });
    }

    next();
};

const validateProduct = (req, res, next) => {
    const body = req.body;

    if (
        body === null ||
        typeof body !== 'object' ||
        Array.isArray(body)
    ) {
        return res.status(422).json({
            success: false,
            message: 'Request body must be a JSON object'
        });
    }

    const isCreateRequest = req.method === 'POST';
    const fields = Object.keys(body);

    if (!isCreateRequest && fields.length === 0) {
        return res.status(422).json({
            success: false,
            message: 'Provide at least one field to update'
        });
    }

    const unknownFields = fields.filter(
        (field) => !allowedFields.has(field)
    );

    if (unknownFields.length > 0) {
        return res.status(422).json({
            success: false,
            message: `Unsupported field: ${unknownFields[0]}`
        });
    }

    if (isCreateRequest) {
        const requiredFields = ['sku', 'name', 'categoryId'];

        for (const field of requiredFields) {
            if (
                body[field] === undefined ||
                body[field] === null ||
                (
                    typeof body[field] === 'string' &&
                    body[field].trim() === ''
                )
            ) {
                return res.status(422).json({
                    success: false,
                    message: `${field} is required`
                });
            }
        }
    }

    const stringRules = [
        { field: 'sku', label: 'SKU', max: 100 },
        { field: 'name', label: 'Product name', max: 200 },
        { field: 'description', label: 'Description', max: 500 },
        { field: 'unit', label: 'Unit', max: 50 }
    ];

    for (const rule of stringRules) {
        const value = body[rule.field];

        if (value === undefined || value === null) {
            if (
                rule.field === 'description' &&
                value === null
            ) {
                continue;
            }

            if (value === null) {
                return res.status(422).json({
                    success: false,
                    message: `${rule.label} must be a string`
                });
            }

            continue;
        }

        if (typeof value !== 'string') {
            return res.status(422).json({
                success: false,
                message: `${rule.label} must be a string`
            });
        }

        const normalizedValue = value.trim();

        if (
            rule.field !== 'description' &&
            normalizedValue.length === 0
        ) {
            return res.status(422).json({
                success: false,
                message: `${rule.label} must not be empty`
            });
        }

        if (normalizedValue.length > rule.max) {
            return res.status(422).json({
                success: false,
                message: `${rule.label} must not exceed ${rule.max} characters`
            });
        }
    }

    if (body.categoryId !== undefined) {
        const categoryId = Number(body.categoryId);

        if (
            !Number.isSafeInteger(categoryId) ||
            categoryId <= 0
        ) {
            return res.status(422).json({
                success: false,
                message: 'categoryId must be a valid positive integer'
            });
        }
    }

    for (const field of numericFields) {
        if (body[field] === undefined) {
            continue;
        }

        const value = body[field];

        if (
            value === null ||
            value === '' ||
            !['number', 'string'].includes(typeof value)
        ) {
            return res.status(422).json({
                success: false,
                message: `${field} must be a valid non-negative number`
            });
        }

        const numberValue = Number(value);

        if (
            !Number.isFinite(numberValue) ||
            numberValue < 0 ||
            numberValue > numericLimits[field]
        ) {
            return res.status(422).json({
                success: false,
                message: `${field} is outside the allowed range`
            });
        }

        if (
            typeof value === 'string' &&
            !/^\d+(\.\d{1,2})?$/.test(value.trim())
        ) {
            return res.status(422).json({
                success: false,
                message: `${field} must have no more than two decimal places`
            });
        }

        if (
            typeof value === 'number' &&
            Math.round(value * 100) !== value * 100
        ) {
            return res.status(422).json({
                success: false,
                message: `${field} must have no more than two decimal places`
            });
        }
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
    validateProduct,
    validateProductId
};
