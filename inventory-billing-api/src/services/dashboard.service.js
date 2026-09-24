const supabase = require('../config/database');

const toNumber = (value) => Number(value || 0);

const getMonthKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');

    return `${year}-${month}`;
};

const getMonthLabel = (date) => {
    return date.toLocaleDateString('en-IN', {
        month: 'short'
    });
};

const getLastSixMonths = () => {
    const months = [];
    const currentDate = new Date();

    currentDate.setDate(1);

    for (let index = 5; index >= 0; index--) {
        const date = new Date(currentDate);

        date.setMonth(currentDate.getMonth() - index);

        months.push({
            key: getMonthKey(date),
            label: getMonthLabel(date),
            year: date.getFullYear()
        });
    }

    return months;
};

const getStartDateForLastSixMonths = () => {
    const currentDate = new Date();

    currentDate.setDate(1);
    currentDate.setHours(0, 0, 0, 0);
    currentDate.setMonth(currentDate.getMonth() - 5);

    return currentDate.toISOString().split('T')[0];
};

const getDashboardSummary = async () => {
    /*
     * Fetch all dashboard data in parallel.
     * Each query uses the existing Stockly database tables.
     */

    const [
        salesResult,
        purchasesResult,
        productsResult,
        customersResult,
        recentInvoicesResult,
        monthlyInvoicesResult,
        monthlyPurchasesResult,
        lowStockResult
    ] = await Promise.all([
        // --------------------------------------------------------
        // TOTAL SALES
        // --------------------------------------------------------
        supabase
            .from('invoices')
            .select('total_amount'),

        // --------------------------------------------------------
        // TOTAL PURCHASES
        // --------------------------------------------------------
        supabase
            .from('purchase_orders')
            .select('total_amount'),

        // --------------------------------------------------------
        // PRODUCTS
        // --------------------------------------------------------
        supabase
            .from('products')
            .select(`
                id,
                name,
                current_stock,
                minimum_stock,
                is_active
            `),

        // --------------------------------------------------------
        // CUSTOMERS
        // --------------------------------------------------------
        supabase
            .from('customers')
            .select(`
                id,
                name,
                is_active
            `),

        // --------------------------------------------------------
        // RECENT SALES
        // --------------------------------------------------------
        supabase
            .from('invoices')
            .select(`
                id,
                invoice_number,
                customer_id,
                invoice_date,
                total_amount,
                status
            `)
            .order('invoice_date', { ascending: false })
            .order('id', { ascending: false })
            .limit(5),

        // --------------------------------------------------------
        // SALES FOR LAST 6 MONTHS
        // --------------------------------------------------------
        supabase
            .from('invoices')
            .select(`
                invoice_date,
                total_amount
            `)
            .gte(
                'invoice_date',
                getStartDateForLastSixMonths()
            )
            .order('invoice_date', { ascending: true }),

        // --------------------------------------------------------
        // PURCHASES FOR LAST 6 MONTHS
        // --------------------------------------------------------
        supabase
            .from('purchase_orders')
            .select(`
                order_date,
                total_amount
            `)
            .gte(
                'order_date',
                getStartDateForLastSixMonths()
            )
            .order('order_date', { ascending: true }),

        // --------------------------------------------------------
        // LOW STOCK PRODUCTS
        // --------------------------------------------------------
        supabase
            .from('products')
            .select(`
                id,
                sku,
                name,
                unit,
                current_stock,
                minimum_stock,
                is_active
            `)
            .eq('is_active', true)
            .order('current_stock', { ascending: true })
    ]);

    // ------------------------------------------------------------
    // HANDLE DATABASE ERRORS
    // ------------------------------------------------------------

    const results = [
        salesResult,
        purchasesResult,
        productsResult,
        customersResult,
        recentInvoicesResult,
        monthlyInvoicesResult,
        monthlyPurchasesResult,
        lowStockResult
    ];

    const failedResult = results.find(result => result.error);

    if (failedResult) {
        throw failedResult.error;
    }

    const sales = salesResult.data || [];
    const purchases = purchasesResult.data || [];
    const products = productsResult.data || [];
    const customers = customersResult.data || [];
    const recentInvoices = recentInvoicesResult.data || [];
    const monthlyInvoices = monthlyInvoicesResult.data || [];
    const monthlyPurchases = monthlyPurchasesResult.data || [];
    const productStockData = lowStockResult.data || [];

    // ------------------------------------------------------------
    // KPI CALCULATIONS
    // ------------------------------------------------------------

    const totalSales = sales.reduce(
        (sum, invoice) => sum + toNumber(invoice.total_amount),
        0
    );

    const totalPurchases = purchases.reduce(
        (sum, purchase) => sum + toNumber(purchase.total_amount),
        0
    );

    const totalProducts = products.filter(
        product => product.is_active
    ).length;

    const totalCustomers = customers.filter(
        customer => customer.is_active
    ).length;

    // ------------------------------------------------------------
    // STOCK STATUS
    // ------------------------------------------------------------

    const activeProducts = products.filter(
        product => product.is_active
    );

    const outOfStock = activeProducts.filter(
        product => toNumber(product.current_stock) <= 0
    );

    const lowStock = activeProducts.filter(
        product =>
            toNumber(product.current_stock) > 0 &&
            toNumber(product.current_stock) <=
                toNumber(product.minimum_stock)
    );

    const inStock = activeProducts.filter(
        product =>
            toNumber(product.current_stock) >
            toNumber(product.minimum_stock)
    );

    // ------------------------------------------------------------
    // SALES VS PURCHASES - LAST 6 MONTHS
    // ------------------------------------------------------------

    const months = getLastSixMonths();

    const salesByMonth = {};
    const purchasesByMonth = {};

    months.forEach(month => {
        salesByMonth[month.key] = 0;
        purchasesByMonth[month.key] = 0;
    });

    monthlyInvoices.forEach(invoice => {
        const invoiceDate = new Date(invoice.invoice_date);
        const monthKey = getMonthKey(invoiceDate);

        if (salesByMonth[monthKey] !== undefined) {
            salesByMonth[monthKey] += toNumber(
                invoice.total_amount
            );
        }
    });

    monthlyPurchases.forEach(purchase => {
        const purchaseDate = new Date(purchase.order_date);
        const monthKey = getMonthKey(purchaseDate);

        if (purchasesByMonth[monthKey] !== undefined) {
            purchasesByMonth[monthKey] += toNumber(
                purchase.total_amount
            );
        }
    });

    const salesPurchases = months.map(month => ({
        month: month.label,
        year: month.year,
        sales: salesByMonth[month.key],
        purchases: purchasesByMonth[month.key]
    }));

    // ------------------------------------------------------------
    // RECENT SALES - CUSTOMER NAMES
    // ------------------------------------------------------------

    const customerIds = [
        ...new Set(
            recentInvoices
                .map(invoice => invoice.customer_id)
                .filter(Boolean)
        )
    ];

    let customerMap = {};

    if (customerIds.length > 0) {
        const { data: recentCustomers, error } = await supabase
            .from('customers')
            .select('id, name')
            .in('id', customerIds);

        if (error) {
            throw error;
        }

        customerMap = (recentCustomers || []).reduce(
            (map, customer) => {
                map[customer.id] = customer.name;
                return map;
            },
            {}
        );
    }

    const recentSales = recentInvoices.map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerId: invoice.customer_id,
        customerName:
            customerMap[invoice.customer_id] || 'Walk-in Customer',
        invoiceDate: invoice.invoice_date,
        totalAmount: toNumber(invoice.total_amount),
        status: invoice.status
    }));

    // ------------------------------------------------------------
    // LOW STOCK PRODUCTS
    // ------------------------------------------------------------

    const lowStockItems = productStockData
        .filter(
            product =>
                toNumber(product.current_stock) <=
                toNumber(product.minimum_stock)
        )
        .map(product => ({
            id: product.id,
            sku: product.sku,
            name: product.name,
            unit: product.unit,
            currentStock: toNumber(product.current_stock),
            minimumStock: toNumber(product.minimum_stock),
            status:
                toNumber(product.current_stock) <= 0
                    ? 'out-of-stock'
                    : 'low-stock'
        }));

    // ------------------------------------------------------------
    // FINAL DASHBOARD RESPONSE
    // ------------------------------------------------------------

    return {
        kpis: {
            totalSales,
            totalPurchases,
            totalProducts,
            totalCustomers
        },

        salesPurchases,

        stockStatuses: {
            inStock: inStock.length,
            lowStock: lowStock.length,
            outOfStock: outOfStock.length
        },

        recentSales,

        lowStockItems
    };
};

module.exports = {
    getDashboardSummary
};