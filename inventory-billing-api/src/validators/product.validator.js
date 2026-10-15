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

const decimalPattern = /^\d+(\.\d{1,2})?$/;

const sendValidationError = (res, message) =>
    res.status(422).json({
        success: false,
        message
    });

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
        return sendValidationError(
            res,
            'Request body must be a JSON object'
        );
    }

    const isCreateRequest = req.method === 'POST';
    const fields = Object.keys(body);

    if (fields.length === 0) {
        return sendValidationError(
            res,
            isCreateRequest
                ? 'Request body must not be empty'
                : 'Provide at least one field to update'
        );
    }

    const unknownFields = fields.filter(
        (field) => !allowedFields.has(field)
    );

    if (unknownFields.length > 0) {
        return sendValidationError(
            res,
            `Unsupported field: ${unknownFields[0]}`
        );
    }

    if (isCreateRequest) {
        for (const field of ['sku', 'name', 'categoryId']) {
            const value = body[field];

            if (
                value === undefined ||
                value === null ||
                (
                    typeof value === 'string' &&
                    value.trim() === ''
                )
            ) {
                return sendValidationError(
                    res,
                    `${field} is required`
                );
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

        if (value === undefined) {
            continue;
        }

        if (
            value === null &&
            rule.field === 'description'
        ) {
            continue;
        }

        if (typeof value !== 'string') {
            return sendValidationError(
                res,
                `${rule.label} must be a string`
            );
        }

        const normalizedValue = value.trim();

        if (
            rule.field !== 'description' &&
            normalizedValue.length === 0
        ) {
            return sendValidationError(
                res,
                `${rule.label} must not be empty`
            );
        }

        if (normalizedValue.length > rule.max) {
            return sendValidationError(
                res,
                `${rule.label} must not exceed ${rule.max} characters`
            );
        }
    }

    if (body.categoryId !== undefined) {
        const categoryId = body.categoryId;

        if (
            !(
                typeof categoryId === 'number' ||
                (
                    typeof categoryId === 'string' &&
                    /^\d+$/.test(categoryId.trim())
                )
            ) ||
            !Number.isSafeInteger(Number(categoryId)) ||
            Number(categoryId) <= 0
        ) {
            return sendValidationError(
                res,
                'categoryId must be a valid positive integer'
            );
        }
    }

    for (const field of numericFields) {
        if (body[field] === undefined) {
            continue;
        }

        const value = body[field];

        if (
            value === null ||
            !['number', 'string'].includes(typeof value) ||
            (
                typeof value === 'string' &&
                value.trim() === ''
            )
        ) {
            return sendValidationError(
                res,
                `${field} must be a valid non-negative number`
            );
        }

        if (
            typeof value === 'string' &&
            !decimalPattern.test(value.trim())
        ) {
            return sendValidationError(
                res,
                `${field} must be a non-negative number with no more than two decimal places`
            );
        }

        const numberValue = Number(value);

        if (
            !Number.isFinite(numberValue) ||
            numberValue < 0 ||
            numberValue > numericLimits[field]
        ) {
            return sendValidationError(
                res,
                `${field} is outside the allowed range`
            );
        }

        if (
            typeof value === 'number' &&
            Math.round(value * 100) !== value * 100
        ) {
            return sendValidationError(
                res,
                `${field} must have no more than two decimal places`
            );
        }
    }

    if (
        body.isActive !== undefined &&
        typeof body.isActive !== 'boolean'
    ) {
        return sendValidationError(
            res,
            'isActive must be a boolean'
        );
    }

    next();
};

module.exports = {
    validateProduct,
    validateProductId
};