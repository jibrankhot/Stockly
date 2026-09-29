
const supabase = require('../config/database');

const mapSupplier = (supplier) => ({
    id: supplier.id,
    code: supplier.supplier_code,
    name: supplier.name,
    email: supplier.email,
    phone: supplier.phone,
    address: supplier.address,
    city: supplier.city,
    state: supplier.state,
    postalCode: supplier.postal_code,
    taxNumber: supplier.tax_number,
    isActive: supplier.is_active,
    createdAt: supplier.created_at,
    updatedAt: supplier.updated_at
});

const getSuppliers = async () => {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data.map(mapSupplier);
};

const getSupplierById = async (id) => {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        const notFoundError = new Error('Supplier not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    return mapSupplier(data);
};

const createSupplier = async (supplierData) => {
    const insertData = {
        supplier_code: supplierData.code || supplierData.supplierCode || null,
        name: supplierData.name.trim(),
        email: supplierData.email || null,
        phone: supplierData.phone || null,
        address: supplierData.address || null,
        city: supplierData.city || null,
        state: supplierData.state || null,
        postal_code: supplierData.postalCode || null,
        tax_number: supplierData.taxNumber || null,
        is_active: supplierData.isActive ?? true
    };

    const { data, error } = await supabase
        .from('suppliers')
        .insert(insertData)
        .select('*')
        .single();

    if (error) {
        if (error.code === '23505') {
            const duplicateError = new Error(
                'Supplier code already exists'
            );
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        throw new Error(error.message);
    }

    return mapSupplier(data);
};

const updateSupplier = async (id, supplierData) => {
    const updateData = {};

    if (supplierData.code !== undefined || supplierData.supplierCode !== undefined) {
        updateData.supplier_code =
            supplierData.code || supplierData.supplierCode || null;
    }

    if (supplierData.name !== undefined) {
        updateData.name = supplierData.name.trim();
    }

    if (supplierData.email !== undefined) {
        updateData.email = supplierData.email || null;
    }

    if (supplierData.phone !== undefined) {
        updateData.phone = supplierData.phone || null;
    }

    if (supplierData.address !== undefined) {
        updateData.address = supplierData.address || null;
    }

    if (supplierData.city !== undefined) {
        updateData.city = supplierData.city || null;
    }

    if (supplierData.state !== undefined) {
        updateData.state = supplierData.state || null;
    }

    if (supplierData.postalCode !== undefined) {
        updateData.postal_code = supplierData.postalCode || null;
    }

    if (supplierData.taxNumber !== undefined) {
        updateData.tax_number = supplierData.taxNumber || null;
    }

    if (supplierData.isActive !== undefined) {
        updateData.is_active = supplierData.isActive;
    }

    const { data, error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .maybeSingle();

    if (error) {
        if (error.code === '23505') {
            const duplicateError = new Error(
                'Supplier code already exists'
            );
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        throw new Error(error.message);
    }

    if (!data) {
        const notFoundError = new Error('Supplier not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    return mapSupplier(data);
};

const deleteSupplier = async (id) => {
    const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') {
            const conflictError = new Error(
                'Supplier cannot be deleted because transactions reference it'
            );
            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw new Error(error.message);
    }

    return true;
};

module.exports = {
    getSuppliers,
    getSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier
};