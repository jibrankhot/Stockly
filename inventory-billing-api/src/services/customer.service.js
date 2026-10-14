
const supabase = require('../config/database');

const MAX_IMPORT_ROWS = 500;

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

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

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
        throw createHttpError('Customer not found', 404);
    }

    return mapCustomer(data);
};

const createCustomer = async (customerData) => {
    const insertData = {
        customer_code:
            customerData.code || customerData.customerCode || null,
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
            throw createHttpError('Customer code already exists', 409);
        }

        throw new Error(error.message);
    }

    return mapCustomer(data);
};

const updateCustomer = async (id, customerData) => {
    const updateData = {};

    if (
        customerData.code !== undefined ||
        customerData.customerCode !== undefined
    ) {
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
            throw createHttpError('Customer code already exists', 409);
        }

        throw new Error(error.message);
    }

    if (!data) {
        throw createHttpError('Customer not found', 404);
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
            throw createHttpError(
                'Customer cannot be deleted because transactions reference it',
                409
            );
        }

        throw new Error(error.message);
    }

    return true;
};

const importCustomers = async (customers) => {
    if (!Array.isArray(customers) || customers.length === 0) {
        throw createHttpError(
            'Provide at least one customer to import',
            400
        );
    }

    if (customers.length > MAX_IMPORT_ROWS) {
        throw createHttpError(
            `You can import a maximum of ${MAX_IMPORT_ROWS} customers at a time`,
            400
        );
    }

    const results = customers.map((customer, index) => ({
        row: index + 1,
        code: '',
        name: '',
        status: 'pending',
        message: ''
    }));

    const normalizedCustomers = [];
    const seenCodes = new Set();

    const getValue = (customer, ...keys) => {
        for (const key of keys) {
            if (customer[key] !== undefined) {
                return customer[key];
            }
        }

        return undefined;
    };

    const optionalText = (value) => {
        if (value === undefined || value === null) {
            return null;
        }

        const text = String(value).trim();
        return text || null;
    };

    const parseActive = (value) => {
        if (value === undefined || value === null || value === '') {
            return { valid: true, value: true };
        }

        if (typeof value === 'boolean') {
            return { valid: true, value };
        }

        const normalized = String(value).trim().toLowerCase();

        if (['true', 'yes', '1', 'active'].includes(normalized)) {
            return { valid: true, value: true };
        }

        if (['false', 'no', '0', 'inactive'].includes(normalized)) {
            return { valid: true, value: false };
        }

        return { valid: false, value: null };
    };

    const fieldLimits = {
        code: 100,
        name: 200,
        email: 255,
        phone: 30,
        city: 100,
        state: 100,
        postalCode: 20,
        taxNumber: 100
    };

    // Validate every row before making database changes.
    for (let index = 0; index < customers.length; index += 1) {
        const customer = customers[index];
        const result = results[index];

        if (
            !customer ||
            typeof customer !== 'object' ||
            Array.isArray(customer)
        ) {
            result.status = 'invalid';
            result.message = 'Invalid customer row';
            continue;
        }

        const code = String(
            getValue(customer, 'code', 'customerCode', 'customer_code') ?? ''
        ).trim();

        const name = String(
            getValue(customer, 'name') ?? ''
        ).trim();

        result.code = code;
        result.name = name;

        if (!code || !name) {
            result.status = 'invalid';
            result.message = 'Customer code and name are required';
            continue;
        }

        const row = {
            code,
            name,
            email: optionalText(getValue(customer, 'email')),
            phone: optionalText(getValue(customer, 'phone')),
            address: optionalText(getValue(customer, 'address')),
            city: optionalText(getValue(customer, 'city')),
            state: optionalText(getValue(customer, 'state')),
            postalCode: optionalText(
                getValue(customer, 'postalCode', 'postal_code')
            ),
            taxNumber: optionalText(
                getValue(customer, 'taxNumber', 'tax_number')
            )
        };

        const tooLongField = Object.entries(fieldLimits).find(
            ([field, limit]) =>
                row[field] !== null &&
                row[field] !== undefined &&
                row[field].length > limit
        );

        if (tooLongField) {
            result.status = 'invalid';
            result.message =
                `${tooLongField[0]} exceeds ${tooLongField[1]} characters`;
            continue;
        }

        if (
            row.email &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)
        ) {
            result.status = 'invalid';
            result.message = 'Invalid email address';
            continue;
        }

        const active = parseActive(
            getValue(customer, 'isActive', 'is_active')
        );

        if (!active.valid) {
            result.status = 'invalid';
            result.message =
                'Invalid active status; use true/false, yes/no, or 1/0';
            continue;
        }

        // Match the database's case-sensitive unique constraint.
        if (seenCodes.has(row.code)) {
            result.status = 'skipped';
            result.message = 'Duplicate customer code within this file';
            continue;
        }

        seenCodes.add(row.code);

        normalizedCustomers.push({
            index,
            ...row,
            isActive: active.value
        });
    }

    // Check existing codes before inserting any valid rows.
    const codesToCheck = normalizedCustomers.map(
        (customer) => customer.code
    );

    if (codesToCheck.length > 0) {
        const { data: existingCustomers, error } = await supabase
            .from('customers')
            .select('customer_code')
            .in('customer_code', codesToCheck);

        if (error) {
            throw new Error(
                `Unable to check existing customer codes: ${error.message}`
            );
        }

        const existingCodes = new Set(
            (existingCustomers || []).map(
                (customer) => customer.customer_code
            )
        );

        for (const customer of normalizedCustomers) {
            const result = results[customer.index];

            if (existingCodes.has(customer.code)) {
                result.status = 'skipped';
                result.message = 'Customer code already exists';
            }
        }
    }

    // Insert eligible rows individually so each outcome is reported.
    for (const customer of normalizedCustomers) {
        const result = results[customer.index];

        if (result.status !== 'pending') {
            continue;
        }

        const insertData = {
            customer_code: customer.code,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            postal_code: customer.postalCode,
            tax_number: customer.taxNumber,
            is_active: customer.isActive
        };

        const { data, error } = await supabase
            .from('customers')
            .insert(insertData)
            .select('id')
            .single();

        if (error) {
            if (error.code === '23505') {
                result.status = 'skipped';
                result.message = 'Customer code already exists';
                continue;
            }

            result.status = 'failed';
            result.message = 'Database could not save this customer';
            continue;
        }

        result.status = 'imported';
        result.message = `Imported successfully (ID: ${data.id})`;
    }

    return {
        totalRows: results.length,
        importedCount: results.filter(
            (result) => result.status === 'imported'
        ).length,
        skippedCount: results.filter(
            (result) => result.status === 'skipped'
        ).length,
        invalidCount: results.filter(
            (result) => result.status === 'invalid'
        ).length,
        failedCount: results.filter(
            (result) => result.status === 'failed'
        ).length,
        results
    };
};

module.exports = {
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    importCustomers
};
