const categoryService = require('../services/category.service');
const {
    successResponse,
    errorResponse
} = require('../utils/api-response');

const getCategories = async (req, res) => {
    try {
        const categories =
            await categoryService.getCategories();

        return successResponse(
            res,
            categories,
            'Categories fetched successfully'
        );
    } catch (error) {
        return errorResponse(
            res,
            error.message,
            error.statusCode || 500
        );
    }
};

const getCategoryById = async (req, res) => {
    try {
        const category =
            await categoryService.getCategoryById(
                Number(req.params.id)
            );

        return successResponse(
            res,
            category,
            'Category fetched successfully'
        );
    } catch (error) {
        return errorResponse(
            res,
            error.message,
            error.statusCode || 500
        );
    }
};

const createCategory = async (req, res) => {
    try {
        const category =
            await categoryService.createCategory(
                req.body
            );

        return successResponse(
            res,
            category,
            'Category created successfully',
            201
        );
    } catch (error) {
        return errorResponse(
            res,
            error.message,
            error.statusCode || 500
        );
    }
};

const updateCategory = async (req, res) => {
    try {
        const category =
            await categoryService.updateCategory(
                Number(req.params.id),
                req.body
            );

        return successResponse(
            res,
            category,
            'Category updated successfully'
        );
    } catch (error) {
        return errorResponse(
            res,
            error.message,
            error.statusCode || 500
        );
    }
};

const deleteCategory = async (req, res) => {
    try {
        await categoryService.deleteCategory(
            Number(req.params.id)
        );

        return successResponse(
            res,
            null,
            'Category deleted successfully'
        );
    } catch (error) {
        return errorResponse(
            res,
            error.message,
            error.statusCode || 500
        );
    }
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};