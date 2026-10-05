const supabase = require('../config/database');

const mapCategory = (category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    isActive: category.is_active,
    createdAt: category.created_at,
    updatedAt: category.updated_at
});

const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return (data ?? []).map(mapCategory);
};

const getCategoryById = async (id) => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw new Error(error.message);
    }

    if (!data) {
        const notFoundError = new Error(
            'Category not found'
        );

        notFoundError.statusCode = 404;

        throw notFoundError;
    }

    return mapCategory(data);
};

const createCategory = async (categoryData) => {
    const insertData = {
        name: categoryData.name.trim(),
        description: categoryData.description || null,
        is_active: categoryData.isActive ?? true
    };

    const { data, error } = await supabase
        .from('categories')
        .insert(insertData)
        .select('*')
        .single();

    if (error) {
        if (error.code === '23505') {
            const duplicateError = new Error(
                'Category name already exists'
            );

            duplicateError.statusCode = 409;

            throw duplicateError;
        }

        throw new Error(error.message);
    }

    return mapCategory(data);
};

const updateCategory = async (
    id,
    categoryData
) => {
    const updateData = {};

    if (categoryData.name !== undefined) {
        updateData.name =
            categoryData.name.trim();
    }

    if (categoryData.description !== undefined) {
        updateData.description =
            categoryData.description || null;
    }

    if (categoryData.isActive !== undefined) {
        updateData.is_active =
            categoryData.isActive;
    }

    const { data, error } = await supabase
        .from('categories')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .maybeSingle();

    if (error) {
        if (error.code === '23505') {
            const duplicateError = new Error(
                'Category name already exists'
            );

            duplicateError.statusCode = 409;

            throw duplicateError;
        }

        throw new Error(error.message);
    }

    if (!data) {
        const notFoundError = new Error(
            'Category not found'
        );

        notFoundError.statusCode = 404;

        throw notFoundError;
    }

    return mapCategory(data);
};

const deleteCategory = async (id) => {
    const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

    if (error) {
        if (error.code === '23503') {
            const conflictError = new Error(
                'Category cannot be deleted because products are using it'
            );

            conflictError.statusCode = 409;

            throw conflictError;
        }

        throw new Error(error.message);
    }

    return true;
};

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};