const validateProduct = (req, res, next) => {
    const body = req.body || {};

    const isCreateRequest = req.method === 'POST';

    const requiredFields = [
        'sku',
        'name',
        'categoryId'
    ];

    if (isCreateRequest) {
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

    if (body.sku !== undefined) {
        if (
            typeof body.sku !== 'string' ||
            body.sku.trim() === ''
        ) {
            return res.status(422).json({
                success: false,
                message: 'SKU must be a non-empty string'
            });
        }
    }

    if (body.name !== undefined) {
        if (
            typeof body.name !== 'string' ||
            body.name.trim() === ''
        ) {
            return res.status(422).json({
                success: false,
                message: 'Product name must be a non-empty string'
            });
        }
    }

    if (body.description !== undefined) {
        if (
            body.description !== null &&
            typeof body.description !== 'string'
        ) {
            return res.status(422).json({
                success: false,
                message: 'Description must be a string'
            });
        }
    }

    if (body.categoryId !== undefined) {
        if (
            !Number.isInteger(Number(body.categoryId)) ||
            Number(body.categoryId) <= 0
        ) {
            return res.status(422).json({
                success: false,
                message: 'categoryId must be a valid ID'
            });
        }
    }

    if (body.unit !== undefined) {
        if (
            typeof body.unit !== 'string' ||
            body.unit.trim() === ''
        ) {
            return res.status(422).json({
                success: false,
                message: 'Unit must be a non-empty string'
            });
        }
    }

    const numericFields = [
        'purchasePrice',
        'sellingPrice',
        'taxRate',
        'currentStock',
        'minimumStock'
    ];

    for (const field of numericFields) {
        if (body[field] !== undefined) {
            const value = Number(body[field]);

            if (
                Number.isNaN(value) ||
                !Number.isFinite(value) ||
                value < 0
            ) {
                return res.status(422).json({
                    success: false,
                    message:
                        `${field} must be a valid non-negative number`
                });
            }
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
    validateProduct
};