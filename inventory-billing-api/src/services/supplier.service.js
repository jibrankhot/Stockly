
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

const createServiceError = (message, statusCode = 500) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const handleDatabaseError = (error, operation) => {
    if (error.code === '23505') {
        throw createServiceError(
            'A supplier with this code or another unique field already exists',
            409
        );
    }

    if (error.code === '23503') {
        throw createServiceError(
            'Supplier cannot be deleted because related records reference it',
            409
        );
    }

    console.error(`Supplier ${operation} failed:`, error);

    throw createServiceError(
        `Unable to ${operation} supplier data`
    );
};

const normalizeNullableString = (value) => {
    if (value === undefined || value === null) {
        return null;
    }

    const normalized = String(value).trim();

    return normalized || null;
};

const getSuppliers = async () => {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        handleDatabaseError(error, 'retrieve');
    }

    return (data || []).map(mapSupplier);
};

const getSupplierById = async (id) => {
    const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        handleDatabaseError(error, 'retrieve');
    }

    if (!data) {
        throw createServiceError('Supplier not found', 404);
    }

    return mapSupplier(data);
};

const createSupplier = async (supplierData) => {
    
const insertData = {
    supplier_code: (supplierData.code ?? supplierData.supplierCode).trim(),
    name: supplierData.name.trim(),
    email: normalizeNullableString(supplierData.email),
    phone: normalizeNullableString(supplierData.phone),
    address: normalizeNullableString(supplierData.address),
    city: normalizeNullableString(supplierData.city),
    state: normalizeNullableString(supplierData.state),
    postal_code: normalizeNullableString(supplierData.postalCode),
    tax_number: normalizeNullableString(supplierData.taxNumber),
    is_active: supplierData.isActive ?? true
};


    const { data, error } = await supabase
        .from('suppliers')
        .insert(insertData)
        .select('*')
        .single();

    if (error) {
        handleDatabaseError(error, 'create');
    }

    return mapSupplier(data);
};

const updateSupplier = async (id, supplierData) => {
    const updateData = {};

    if (
        supplierData.code !== undefined ||
        supplierData.supplierCode !== undefined
    ) {
        updateData.supplier_code = normalizeNullableString(
            supplierData.code ?? supplierData.supplierCode
        );
    }

    if (supplierData.name !== undefined) {
        updateData.name = supplierData.name.trim();
    }

    if (supplierData.email !== undefined) {
        updateData.email = normalizeNullableString(supplierData.email);
    }

    if (supplierData.phone !== undefined) {
        updateData.phone = normalizeNullableString(supplierData.phone);
    }

    if (supplierData.address !== undefined) {
        updateData.address = normalizeNullableString(supplierData.address);
    }

    if (supplierData.city !== undefined) {
        updateData.city = normalizeNullableString(supplierData.city);
    }

    if (supplierData.state !== undefined) {
        updateData.state = normalizeNullableString(supplierData.state);
    }

    if (supplierData.postalCode !== undefined) {
        updateData.postal_code = normalizeNullableString(
            supplierData.postalCode
        );
    }

    if (supplierData.taxNumber !== undefined) {
        updateData.tax_number = normalizeNullableString(
            supplierData.taxNumber
        );
    }

    if (supplierData.isActive !== undefined) {
        updateData.is_active = supplierData.isActive;
    }

    if (Object.keys(updateData).length === 0) {
        throw createServiceError(
            'At least one field must be provided for an update',
            400
        );
    }

    const { data, error } = await supabase
        .from('suppliers')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .maybeSingle();

    if (error) {
        handleDatabaseError(error, 'update');
    }

    if (!data) {
        throw createServiceError('Supplier not found', 404);
    }

    return mapSupplier(data);
};

const deleteSupplier = async (id) => {
    const { data, error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();

    if (error) {
        handleDatabaseError(error, 'delete');
    }

    if (!data) {
        throw createServiceError('Supplier not found', 404);
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
