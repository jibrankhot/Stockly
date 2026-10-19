
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Invoice } from '../../../../shared/models/invoice';
import {
  PaymentMethod
} from '../../../../shared/models/payment';

import { InvoiceService } from '../../../sales/invoices/services/invoice.service';
import {
  PaymentService,
  CreatePaymentRequest
} from '../../services/payment.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-payment-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './payment-create.component.html',
  styleUrl: './payment-create.component.scss'
})
export class PaymentCreateComponent implements OnInit {

  invoices: Invoice[] = [];
  selectedInvoice: Invoice | null = null;

  paymentForm: FormGroup;

  readonly paymentMethods: {
    value: PaymentMethod;
    label: string;
  }[] = [
      { value: 'Cash', label: 'Cash' },
      { value: 'Bank Transfer', label: 'Bank Transfer' },
      { value: 'UPI', label: 'UPI' },
      { value: 'Card', label: 'Card' },
      { value: 'Cheque', label: 'Cheque' },
      { value: 'Other', label: 'Other' }
    ];

  isLoading = true;
  isSaving = false;
  errorMessage = '';

  constructor(
    private readonly fb: FormBuilder,
    private readonly invoiceService: InvoiceService,
    private readonly paymentService: PaymentService,
    private readonly notificationService: NotificationService,
    private readonly router: Router
  ) {
    this.paymentForm = this.fb.group({
      invoiceId: ['', Validators.required],
      paymentDate: [this.getToday(), Validators.required],
      amount: [
        0,
        [
          Validators.required,
          Validators.min(0.01)
        ]
      ],
      paymentMethod: ['Cash', Validators.required],
      referenceNumber: ['', Validators.maxLength(100)],
      notes: ['', Validators.maxLength(250)]
    });
  }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.invoiceService.getInvoices().subscribe({
      next: invoices => {
        this.invoices = invoices.filter(invoice => {
          const status = String(invoice.status).toLowerCase();

          return status !== 'cancelled' &&
            status !== 'paid' &&
            Number(invoice.totalAmount) > 0;
        });

        this.isLoading = false;
      },

      error: error => {
        console.error('Failed to load invoices:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to load invoices. Please try again.';

        this.isLoading = false;

        this.notificationService.error(this.errorMessage);
      }
    });
  }

  onInvoiceChange(): void {
    const invoiceId = Number(
      this.paymentForm.get('invoiceId')?.value
    );

    this.selectedInvoice =
      this.invoices.find(invoice => invoice.id === invoiceId) ?? null;

    if (this.selectedInvoice) {
      this.paymentForm.patchValue({
        amount: this.getInvoiceBalance(this.selectedInvoice)
      });
    } else {
      this.paymentForm.patchValue({ amount: 0 });
    }

    this.errorMessage = '';
  }

  getInvoiceBalance(invoice: Invoice): number {
    const total = Number(invoice.totalAmount) || 0;
    const paid = Number(
      (invoice as Invoice & { paidAmount?: number }).paidAmount
    ) || 0;

    return Math.max(total - paid, 0);
  }

  get paymentAmount(): number {
    return Number(this.paymentForm.get('amount')?.value) || 0;
  }

  get invoiceTotal(): number {
    return this.selectedInvoice
      ? this.getInvoiceBalance(this.selectedInvoice)
      : 0;
  }

  get remainingAfterPayment(): number {
    return Math.max(this.invoiceTotal - this.paymentAmount, 0);
  }

  savePayment(): void {
    if (this.isSaving) {
      return;
    }

    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    if (!this.selectedInvoice) {
      this.errorMessage = 'Please select an invoice.';
      return;
    }

    if (this.paymentAmount > this.invoiceTotal) {
      this.errorMessage =
        'Payment amount cannot exceed the remaining invoice balance.';
      return;
    }

    const formValue = this.paymentForm.getRawValue();

    const paymentData: CreatePaymentRequest = {
      invoiceId: this.selectedInvoice.id,
      paymentDate: formValue.paymentDate,
      amount: this.paymentAmount,
      paymentMethod: formValue.paymentMethod as PaymentMethod,
      referenceNumber: formValue.referenceNumber?.trim() || null,
      notes: formValue.notes?.trim() || null
    };

    this.isSaving = true;
    this.errorMessage = '';

    this.paymentService.createPayment(paymentData).subscribe({
      next: payment => {
        this.isSaving = false;

        this.notificationService.success(
          'Payment recorded successfully.'
        );

        this.router.navigate(['/payments', payment.id]);
      },

      error: error => {
        console.error('Failed to save payment:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to save payment. Please try again.';

        this.isSaving = false;

        this.notificationService.error(this.errorMessage);
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/payments']);
  }

  private getToday(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
