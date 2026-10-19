
export interface Payment {
    id: number;
    paymentNumber: string;
    invoiceId: number;
    invoiceNumber: string;
    customerId: number | null;
    customerName: string;
    paymentDate: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string | null;
    notes: string | null;
    createdBy: number | null;
    createdAt: string;
    updatedAt: string;
}

export type PaymentMethod =
    | 'Cash'
    | 'Card'
    | 'UPI'
    | 'Bank Transfer'
    | 'Cheque'
    | 'Other';
