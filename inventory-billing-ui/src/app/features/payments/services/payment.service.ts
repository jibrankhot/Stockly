
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { Payment, PaymentMethod } from '../../../shared/models/payment';
import { environment } from '../../../../environments/environment';

export interface CreatePaymentRequest {
    invoiceId: number;
    paymentDate?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    referenceNumber?: string | null;
    notes?: string | null;
}

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    private readonly http = inject(HttpClient);

    private readonly apiUrl =
        `${environment.apiUrl}/api/payments`;

    getPayments(): Observable<Payment[]> {
        return this.http.get<Payment[]>(this.apiUrl);
    }

    getPaymentById(id: number): Observable<Payment> {
        return this.http.get<Payment>(
            `${this.apiUrl}/${id}`
        );
    }

    getPaymentsByInvoiceId(
        invoiceId: number
    ): Observable<Payment[]> {
        return this.getPayments().pipe(
            map(payments =>
                payments.filter(
                    payment => payment.invoiceId === invoiceId
                )
            )
        );
    }

    createPayment(
        paymentData: CreatePaymentRequest
    ): Observable<Payment> {
        return this.http.post<Payment>(
            this.apiUrl,
            paymentData
        );
    }

    deletePayment(id: number): Observable<boolean> {
        return this.http
            .delete<{ success: boolean; id: number }>(
                `${this.apiUrl}/${id}`
            )
            .pipe(
                map(response => response.success)
            );
    }
}
