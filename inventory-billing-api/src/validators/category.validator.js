const validateCategory = (req, res, next) => {
    const {
        name,
        description,
        isActive
    } = req.body || {};

    // Name is required when creating a category.
    if (
        req.method === 'POST' &&
        (
            name === undefined ||
            typeof name !== 'string' ||
            !name.trim()
        )
    ) {
        return res.status(422).json({
            success: false,
            message: 'Category name is required'
        });
    }

    // If name is provided, it must be a non-empty string.
    if (
        name !== undefined &&
        (
            typeof name !== 'string' ||
            !name.trim()
        )
    ) {
        return res.status(422).json({
            success: false,
            message: 'Category name must be a valid string'
        });
    }

    // Description is optional, but must be a string when provided.
    if (
        description !== undefined &&
        description !== null &&
        typeof description !== 'string'
    ) {
        return res.status(422).json({
            success: false,
            message: 'Description must be a string'
        });
    }

    // isActive is optional, but must be boolean when provided.
    if (
        isActive !== undefined &&
        typeof isActive !== 'boolean'
    ) {
        return res.status(422).json({
            success: false,
            message: 'isActive must be a boolean'
        });
    }

    next();
};

module.exports = {
    validateCategory
};