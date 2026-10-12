
const supabase = require('../config/database');

const productSelect = `
    *,
    categories (
        id,
        name
    )
`;

const mapProduct = (product) => ({
    id: Number(product.id),
    sku: product.sku,
    name: product.name,
    description: product.description ?? '',
    categoryId: Number(product.category_id),
    categoryName: product.categories?.name || '',
    unit: product.unit,
    purchasePrice: Number(product.purchase_price),
    sellingPrice: Number(product.selling_price),
    taxRate: Number(product.tax_rate),
    currentStock: Number(product.current_stock),
    minimumStock: Number(product.minimum_stock),
    isActive: product.is_active,
    createdAt: product.created_at,
    updatedAt: product.updated_at
});

const createHttpError = (message, statusCode) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const handleDatabaseError = (error) => {
    if (error.code === '23505') {
        throw createHttpError(
            'Product SKU already exists',
            409
        );
    }

    if (error.code === '23503') {
        throw createHttpError(
            'The selected category is invalid or the product is referenced by existing records',
            409
        );
    }

    throw new Error(error.message || 'Database operation failed');
};

const getProducts = async () => {
    const { data, error } = await supabase
        .from('products')
        .select(productSelect)
        .order('name', { ascending: true });

    if (error) {
        handleDatabaseError(error);
    }

    return (data || []).map(mapProduct);
};

const getProductById = async (id) => {
    const { data, error } = await supabase
        .from('products')
        .select(productSelect)
        .eq('id', id)
        .maybeSingle();

    if (error) {
        handleDatabaseError(error);
    }

    if (!data) {
        throw createHttpError('Product not found', 404);
    }

    return mapProduct(data);
};

const createProduct = async (productData) => {
    const insertData = {
        sku: productData.sku.trim(),
        name: productData.name.trim(),
        description:
            typeof productData.description === 'string'
                ? productData.description.trim() || null
                : null,
        category_id: Number(productData.categoryId),
        unit: productData.unit?.trim() || 'pcs',
        purchase_price: Number(productData.purchasePrice ?? 0),
        selling_price: Number(productData.sellingPrice ?? 0),
        tax_rate: Number(productData.taxRate ?? 0),
        current_stock: Number(productData.currentStock ?? 0),
        minimum_stock: Number(productData.minimumStock ?? 0),
        is_active: productData.isActive ?? true
    };

    const { data, error } = await supabase
        .from('products')
        .insert(insertData)
        .select(productSelect)
        .single();

    if (error) {
        handleDatabaseError(error);
    }

    return mapProduct(data);
};

const updateProduct = async (id, productData) => {
    const updateData = {};

    if (productData.sku !== undefined) {
        updateData.sku = productData.sku.trim();
    }

    if (productData.name !== undefined) {
        updateData.name = productData.name.trim();
    }

    if (productData.description !== undefined) {
        updateData.description =
            typeof productData.description === 'string'
                ? productData.description.trim() || null
                : null;
    }

    if (productData.categoryId !== undefined) {
        updateData.category_id = Number(productData.categoryId);
    }

    if (productData.unit !== undefined) {
        updateData.unit = productData.unit.trim();
    }

    if (productData.purchasePrice !== undefined) {
        updateData.purchase_price = Number(productData.purchasePrice);
    }

    if (productData.sellingPrice !== undefined) {
        updateData.selling_price = Number(productData.sellingPrice);
    }

    if (productData.taxRate !== undefined) {
        updateData.tax_rate = Number(productData.taxRate);
    }

    if (productData.currentStock !== undefined) {
        updateData.current_stock = Number(productData.currentStock);
    }

    if (productData.minimumStock !== undefined) {
        updateData.minimum_stock = Number(productData.minimumStock);
    }

    if (productData.isActive !== undefined) {
        updateData.is_active = productData.isActive;
    }

    if (Object.keys(updateData).length === 0) {
        throw createHttpError(
            'Provide at least one field to update',
            422
        );
    }

    const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select(productSelect)
        .maybeSingle();

    if (error) {
        handleDatabaseError(error);
    }

    if (!data) {
        throw createHttpError('Product not found', 404);
    }

    return mapProduct(data);
};

const deleteProduct = async (id) => {
    const { data, error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .select('id')
        .maybeSingle();

    if (error) {
        handleDatabaseError(error);
    }

    if (!data) {
        throw createHttpError('Product not found', 404);
    }

    return true;
};

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
