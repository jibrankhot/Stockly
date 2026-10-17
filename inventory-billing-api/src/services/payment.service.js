
const supabase = require('../config/database');

const mapPayment = (payment, invoice = null, customer = null) => ({
    id: payment.id,
    paymentNumber: payment.payment_number,
    invoiceId: payment.invoice_id,
    invoiceNumber: invoice?.invoice_number || '',
    customerId: payment.customer_id ?? invoice?.customer_id ?? null,
    customerName: customer?.name || '',
    paymentDate: payment.payment_date,
    amount: Number(payment.amount || 0),
    paymentMethod: payment.payment_method,
    referenceNumber: payment.reference_number,
    notes: payment.notes,
    createdBy: payment.created_by,
    createdAt: payment.created_at,
    updatedAt: payment.updated_at
});

const getPayments = async () => {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            invoice:invoices(
                invoice_number,
                customer_id
            )
        `)
        .order('payment_date', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) throw error;

    const payments = data || [];

    const customerIds = [
        ...new Set(
            payments
                .map(payment =>
                    payment.customer_id ?? payment.invoice?.customer_id
                )
                .filter(Boolean)
        )
    ];

    let customers = [];

    if (customerIds.length > 0) {
        const { data: customerData, error: customerError } =
            await supabase
                .from('customers')
                .select('id, name')
                .in('id', customerIds);

        if (customerError) throw customerError;

        customers = customerData || [];
    }

    const customerMap = new Map(
        customers.map(customer => [customer.id, customer])
    );

    return payments.map(payment => {
        const customerId =
            payment.customer_id ?? payment.invoice?.customer_id;

        return mapPayment(
            payment,
            payment.invoice,
            customerMap.get(customerId)
        );
    });
};

const getPaymentById = async (id) => {
    const { data, error } = await supabase
        .from('payments')
        .select(`
            *,
            invoice:invoices(
                invoice_number,
                customer_id
            )
        `)
        .eq('id', id)
        .maybeSingle();

    if (error) throw error;

    if (!data) {
        const err = new Error('Payment not found');
        err.statusCode = 404;
        throw err;
    }

    const customerId =
        data.customer_id ?? data.invoice?.customer_id;

    let customer = null;

    if (customerId) {
        const { data: customerData, error: customerError } =
            await supabase
                .from('customers')
                .select('id, name')
                .eq('id', customerId)
                .maybeSingle();

        if (customerError) throw customerError;

        customer = customerData;
    }

    return mapPayment(data, data.invoice, customer);
};

const createPayment = async (paymentData, userId) => {
    const invoiceId = Number(paymentData.invoiceId);
    const amount = Number(paymentData.amount);

    if (!Number.isSafeInteger(invoiceId) || invoiceId <= 0) {
        const err = new Error('Invalid invoice ID');
        err.statusCode = 422;
        throw err;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        const err = new Error('Payment amount must be greater than zero');
        err.statusCode = 422;
        throw err;
    }

    const paymentMethodMap = {
        cash: 'Cash',
        card: 'Card',
        upi: 'UPI',
        bank_transfer: 'Bank Transfer',
        'bank transfer': 'Bank Transfer',
        cheque: 'Cheque',
        other: 'Other'
    };

    const methodKey = String(paymentData.paymentMethod || '')
        .trim()
        .toLowerCase();

    const paymentMethod = paymentMethodMap[methodKey];

    if (!paymentMethod) {
        const err = new Error('Invalid payment method');
        err.statusCode = 422;
        throw err;
    }

    const { data, error } = await supabase.rpc('create_payment', {
        p_invoice_id: invoiceId,
        p_payment_date: paymentData.paymentDate || null,
        p_amount: amount,
        p_payment_method: paymentMethod,
        p_reference_number: paymentData.referenceNumber || null,
        p_notes: paymentData.notes || null,
        p_created_by: userId || null
    });

    if (error) {
        if (error.code === 'P0002') {
            const err = new Error('Invoice not found');
            err.statusCode = 404;
            throw err;
        }

        if (error.code === '22023') {
            const err = new Error(error.message);
            err.statusCode = 409;
            throw err;
        }

        throw error;
    }

    const paymentId = Number(data);

    if (!Number.isSafeInteger(paymentId) || paymentId <= 0) {
        throw new Error('Payment was created, but its ID was not returned correctly');
    }

    return getPaymentById(paymentId);
};

const deletePayment = async (id) => {
    const paymentId = Number(id);

    if (!Number.isSafeInteger(paymentId) || paymentId <= 0) {
        const err = new Error('Invalid payment ID');
        err.statusCode = 400;
        throw err;
    }

    const { data, error } = await supabase.rpc('delete_payment', {
        p_payment_id: paymentId
    });

    if (error) {
        if (error.code === 'P0002') {
            const err = new Error(error.message || 'Payment not found');
            err.statusCode = 404;
            throw err;
        }

        throw error;
    }

    if (data !== true) {
        throw new Error('Payment deletion could not be confirmed');
    }

    return {
        success: true,
        id: paymentId
    };
};

module.exports = {
    getPayments,
    getPaymentById,
    createPayment,
    deletePayment
};
