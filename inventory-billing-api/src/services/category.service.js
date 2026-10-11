const supabase = require('../config/database');


/* =========================================================
   CATEGORY MAPPER
   ========================================================= */

const mapCategory = (
    category,
    productCount = 0
) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    isActive: category.is_active,
    productCount,
    createdAt: category.created_at,
    updatedAt: category.updated_at
});


/* =========================================================
   PRODUCT COUNT HELPERS
   ========================================================= */

/**
 * Returns product counts grouped by category ID.
 *
 * Expected relationship:
 * products.category_id -> categories.id
 */
const getProductCountsByCategoryIds = async (
    categoryIds
) => {
    if (!categoryIds.length) {
        return new Map();
    }

    const { data, error } = await supabase
        .from('products')
        .select('category_id')
        .in('category_id', categoryIds);

    if (error) {
        throw new Error(error.message);
    }

    const counts = new Map();

    for (const row of data ?? []) {
        const categoryId = row.category_id;

        counts.set(
            categoryId,
            (counts.get(categoryId) ?? 0) + 1
        );
    }

    return counts;
};


/**
 * Returns the product count for one category.
 */
const getProductCount = async (categoryId) => {
    const { count, error } = await supabase
        .from('products')
        .select('id', {
            count: 'exact',
            head: true
        })
        .eq('category_id', categoryId);

    if (error) {
        throw new Error(error.message);
    }

    return count ?? 0;
};


/* =========================================================
   GET ALL CATEGORIES
   ========================================================= */

const getCategories = async () => {
    const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name', {
            ascending: true
        });

    if (error) {
        throw new Error(error.message);
    }

    const categories = data ?? [];

    if (!categories.length) {
        return [];
    }

    const categoryIds = categories.map(
        category => category.id
    );

    const productCounts =
        await getProductCountsByCategoryIds(
            categoryIds
        );

    return categories.map(category =>
        mapCategory(
            category,
            productCounts.get(category.id) ?? 0
        )
    );
};


/* =========================================================
   GET CATEGORY BY ID
   ========================================================= */

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

    const productCount =
        await getProductCount(id);

    return mapCategory(
        data,
        productCount
    );
};


/* =========================================================
   CREATE CATEGORY
   ========================================================= */

const createCategory = async (
    categoryData
) => {
    const insertData = {
        name: categoryData.name.trim(),
        description:
            categoryData.description || null,
        is_active:
            categoryData.isActive ?? true
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

    /*
     * A newly created category cannot have products yet
     * because no product has been assigned to it during
     * this operation.
     */
    return mapCategory(data, 0);
};


/* =========================================================
   UPDATE CATEGORY
   ========================================================= */

const updateCategory = async (
    id,
    categoryData
) => {
    const updateData = {};

    if (categoryData.name !== undefined) {
        updateData.name =
            categoryData.name.trim();
    }

    if (
        categoryData.description !== undefined
    ) {
        updateData.description =
            categoryData.description || null;
    }

    if (
        categoryData.isActive !== undefined
    ) {
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

    const productCount =
        await getProductCount(id);

    return mapCategory(
        data,
        productCount
    );
};


/* =========================================================
   DELETE CATEGORY
   ========================================================= */

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


/* =========================================================
   EXPORTS
   ========================================================= */

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};