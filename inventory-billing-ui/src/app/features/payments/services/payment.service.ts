
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

import { Payment } from '../../../shared/models/payment';

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private payments: Payment[] = [
        {
            id: 1,
            paymentNumber: 'PAY-2026-001',
            invoiceId: 1,
            invoiceNumber: 'INV-2026-001',
            customerName: 'ABC Retail Store',
            paymentDate: '2026-08-28',
            amount: 1000,
            paymentMethod: 'upi',
            referenceNumber: 'UPI-982341',
            notes: 'Part payment received',
            createdAt: '2026-08-28T10:30:00'
        },
        {
            id: 2,
            paymentNumber: 'PAY-2026-002',
            invoiceId: 2,
            invoiceNumber: 'INV-2026-002',
            customerName: 'Tech Solutions Pvt Ltd',
            paymentDate: '2026-08-29',
            amount: 2850,
            paymentMethod: 'bank-transfer',
            referenceNumber: 'NEFT-456782',
            notes: 'Invoice paid in full',
            createdAt: '2026-08-29T14:15:00'
        },
        {
            id: 3,
            paymentNumber: 'PAY-2026-003',
            invoiceId: 3,
            invoiceNumber: 'INV-2026-003',
            customerName: 'Office Hub',
            paymentDate: '2026-08-30',
            amount: 1000,
            paymentMethod: 'cash',
            referenceNumber: '',
            notes: 'Partial payment',
            createdAt: '2026-08-30T11:45:00'
        }
    ];

    getPayments(): Observable<Payment[]> {
        return of(this.payments.map(payment => ({ ...payment })));
    }

    getPaymentById(id: number): Observable<Payment | undefined> {
        const payment = this.payments.find(item => item.id === id);
        return of(payment ? { ...payment } : undefined);
    }

    getPaymentsByInvoiceId(invoiceId: number): Observable<Payment[]> {
        return of(
            this.payments
                .filter(payment => payment.invoiceId === invoiceId)
                .map(payment => ({ ...payment }))
        );
    }

    createPayment(paymentData: Partial<Payment>): Observable<Payment> {
        const id = this.getNextId();

        const payment: Payment = {
            id,
            paymentNumber:
                paymentData.paymentNumber ??
                `PAY-2026-${String(id).padStart(3, '0')}`,
            invoiceId: paymentData.invoiceId ?? 0,
            invoiceNumber: paymentData.invoiceNumber ?? '',
            customerName: paymentData.customerName ?? '',
            paymentDate:
                paymentData.paymentDate ??
                new Date().toISOString().slice(0, 10),
            amount: paymentData.amount ?? 0,
            paymentMethod: paymentData.paymentMethod ?? 'cash',
            referenceNumber: paymentData.referenceNumber ?? '',
            notes: paymentData.notes ?? '',
            createdAt: new Date().toISOString()
        };

        this.payments.push(payment);

        return of({ ...payment });
    }

    deletePayment(id: number): Observable<boolean> {
        const index = this.payments.findIndex(payment => payment.id === id);

        if (index < 0) {
            return of(false);
        }

        this.payments.splice(index, 1);
        return of(true);
    }

    private getNextId(): number {
        return this.payments.reduce(
            (maxId, payment) => Math.max(maxId, payment.id),
            0
        ) + 1;
    }
}
