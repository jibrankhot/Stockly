
const supplierService = require('../services/supplier.service');

const handleError = (res, error) => {
    const statusCode = error.statusCode || 500;

    if (statusCode === 500) {
        console.error('Supplier API error:', error);
    }

    return res.status(statusCode).json({
        success: false,
        message:
            statusCode === 500
                ? 'An unexpected error occurred'
                : error.message
    });
};

const getSuppliers = async (req, res) => {
    try {
        const suppliers = await supplierService.getSuppliers();

        return res.status(200).json(suppliers);
    } catch (error) {
        return handleError(res, error);
    }
};

const getSupplierById = async (req, res) => {
    try {
        const supplier = await supplierService.getSupplierById(
            Number(req.params.id)
        );

        return res.status(200).json(supplier);
    } catch (error) {
        return handleError(res, error);
    }
};

const createSupplier = async (req, res) => {
    try {
        const supplier = await supplierService.createSupplier(req.body);

        return res.status(201).json(supplier);
    } catch (error) {
        return handleError(res, error);
    }
};

const updateSupplier = async (req, res) => {
    try {
        const supplier = await supplierService.updateSupplier(
            Number(req.params.id),
            req.body
        );

        return res.status(200).json(supplier);
    } catch (error) {
        return handleError(res, error);
    }
};

const deleteSupplier = async (req, res) => {
    try {
        await supplierService.deleteSupplier(Number(req.params.id));

        return res.status(200).json(true);
    } catch (error) {
        return handleError(res, error);
    }
};

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};
