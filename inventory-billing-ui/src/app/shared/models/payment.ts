export interface Payment {
    id: number;
    paymentNumber: string;
    invoiceId: number;
    invoiceNumber: string;
    customerName: string;
    paymentDate: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber: string | null;
    notes: string | null;
    createdAt: string;
}

export type PaymentMethod =
    | 'cash'
    | 'bank-transfer'
    | 'upi'
    | 'card'
    | 'cheque';