const supabase = require('../config/database');

const mapCustomer = (customer) => ({
    id: customer.id,
    code: customer.customer_code,
    name: customer.name,
    email: customer.email,
    phone: customer.phone,
    address: customer.address,
    city: customer.city,
    state: customer.state,
    postalCode: customer.postal_code,
    taxNumber: customer.tax_number,
    isActive: customer.is_active,
    createdAt: customer.created_at,
    updatedAt: customer.updated_at
});

const getCustomers = async () => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return data.map(mapCustomer);
};

const getCustomerById = async (id) => {
    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        const notFoundError = new Error('Customer not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    return mapCustomer(data);
};

const createCustomer = async (customerData) => {
    const insertData = {
        customer_code: customerData.code || customerData.customerCode || null,
        name: customerData.name.trim(),
        email: customerData.email || null,
        phone: customerData.phone || null,
        address: customerData.address || null,
        city: customerData.city || null,
        state: customerData.state || null,
        postal_code: customerData.postalCode || null,
        tax_number: customerData.taxNumber || null,
        is_active: customerData.isActive ?? true
    };

    const { data, error } = await supabase
        .from('customers')
        .insert(insertData)
        .select('*')
        .single();

    if (error) {
        if (error.code === '23505') {
            const duplicateError = new Error(
                'Customer code already exists'
            );
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        throw new Error(error.message);
    }

    return mapCustomer(data);
};

const updateCustomer = async (id, customerData) => {
    const updateData = {};

    if (customerData.code !== undefined || customerData.customerCode !== undefined) {
        updateData.customer_code =
            customerData.code ?? customerData.customerCode ?? null;
    }

    if (customerData.name !== undefined) {
        updateData.name = customerData.name.trim();
    }

    if (customerData.email !== undefined) {
        updateData.email = customerData.email || null;
    }

    if (customerData.phone !== undefined) {
        updateData.phone = customerData.phone || null;
    }

    if (customerData.address !== undefined) {
        updateData.address = customerData.address || null;
    }

    if (customerData.city !== undefined) {
        updateData.city = customerData.city || null;
    }

    if (customerData.state !== undefined) {
        updateData.state = customerData.state || null;
    }

    if (customerData.postalCode !== undefined) {
        updateData.postal_code = customerData.postalCode || null;
    }

    if (customerData.taxNumber !== undefined) {
        updateData.tax_number = customerData.taxNumber || null;
    }

    if (customerData.isActive !== undefined) {
        updateData.is_active = customerData.isActive;
    }

    const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .maybeSingle();

    if (error) {
        if (error.code === '23505') {
            const duplicateError = new Error(
                'Customer code already exists'
            );
            duplicateError.statusCode = 409;
            throw duplicateError;
        }

        throw new Error(error.message);
    }

    if (!data) {
        const notFoundError = new Error('Customer not found');
        notFoundError.statusCode = 404;
        throw notFoundError;
    }

    return mapCustomer(data);
};

const deleteCustomer = async (id) => {
    const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') {
            const conflictError = new Error(
                'Customer cannot be deleted because transactions reference it'
            );
            conflictError.statusCode = 409;
            throw conflictError;
        }

        throw new Error(error.message);
    }

    return true;
};

module.exports = {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer
};