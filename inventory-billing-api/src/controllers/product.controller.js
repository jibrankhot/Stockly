const productService = require('../services/product.service');

const getProducts = async (req, res) => {
    try {
        const products =
            await productService.getProducts();

        return res.status(200).json({
            success: true,
            message: 'Products fetched successfully',
            data: products
        });
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json({
                success: false,
                message: error.message
            });
    }
};

const getProductById = async (req, res) => {
    try {
        const product =
            await productService.getProductById(
                Number(req.params.id)
            );

        return res.status(200).json({
            success: true,
            message: 'Product fetched successfully',
            data: product
        });
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json({
                success: false,
                message: error.message
            });
    }
};

const createProduct = async (req, res) => {
    try {
        const product =
            await productService.createProduct(
                req.body
            );

        return res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json({
                success: false,
                message: error.message
            });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product =
            await productService.updateProduct(
                Number(req.params.id),
                req.body
            );

        return res.status(200).json({
            success: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json({
                success: false,
                message: error.message
            });
    }
};

const deleteProduct = async (req, res) => {
    try {
        await productService.deleteProduct(
            Number(req.params.id)
        );

        return res.status(200).json({
            success: true,
            message: 'Product deleted successfully',
            data: null
        });
    } catch (error) {
        return res
            .status(error.statusCode || 500)
            .json({
                success: false,
                message: error.message
            });
    }
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};