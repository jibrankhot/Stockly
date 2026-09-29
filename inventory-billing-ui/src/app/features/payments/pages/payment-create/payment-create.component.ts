
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
import { PaymentMethod } from '../../../../shared/models/payment';

import { InvoiceService } from '../../../sales/invoices/services/invoice.service';
import { PaymentService } from '../../services/payment.service';
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

  paymentMethods: {
    value: PaymentMethod;
    label: string;
  }[] = [
      { value: 'cash', label: 'Cash' },
      { value: 'bank-transfer', label: 'Bank Transfer' },
      { value: 'upi', label: 'UPI' },
      { value: 'card', label: 'Card' },
      { value: 'cheque', label: 'Cheque' }
    ];

  isLoading = true;
  isSaving = false;

  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private invoiceService: InvoiceService,
    private paymentService: PaymentService,
    private notificationService: NotificationService,
    private router: Router
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
      paymentMethod: ['cash', Validators.required],
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

    this.invoiceService
      .getInvoices()
      .subscribe({
        next: invoices => {
          this.invoices = invoices.filter(
            invoice => invoice.status !== 'cancelled'
          );

          this.isLoading = false;
        },

        error: error => {
          this.errorMessage = 'Unable to load invoices.';
          this.isLoading = false;

          console.error('Failed to load invoices:', error);

          this.notificationService.error(
            error?.error?.message ||
            'Unable to load invoices. Please try again.'
          );
        }
      });
  }

  onInvoiceChange(): void {
    const invoiceId = Number(
      this.paymentForm.get('invoiceId')?.value
    );

    this.selectedInvoice = this.invoices.find(
      invoice => invoice.id === invoiceId
    ) ?? null;

    if (this.selectedInvoice) {
      this.paymentForm.patchValue({
        amount: this.selectedInvoice.totalAmount
      });
    } else {
      this.paymentForm.patchValue({
        amount: 0
      });
    }
  }

  get paymentAmount(): number {
    return Number(
      this.paymentForm.get('amount')?.value
    ) || 0;
  }

  get invoiceTotal(): number {
    return this.selectedInvoice?.totalAmount ?? 0;
  }

  get remainingAfterPayment(): number {
    const remaining = this.invoiceTotal - this.paymentAmount;

    return Math.max(remaining, 0);
  }

  savePayment(): void {
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
        'Payment amount cannot exceed the invoice total.';
      return;
    }

    const paymentData = {
      invoiceId: this.selectedInvoice.id,
      invoiceNumber: this.selectedInvoice.invoiceNumber,
      customerName: this.selectedInvoice.customerName,
      paymentDate: this.paymentForm.get('paymentDate')?.value,
      amount: this.paymentAmount,
      paymentMethod: this.paymentForm.get('paymentMethod')?.value,
      referenceNumber:
        this.paymentForm.get('referenceNumber')?.value?.trim() ?? '',
      notes:
        this.paymentForm.get('notes')?.value?.trim() ?? ''
    };

    this.isSaving = true;
    this.errorMessage = '';

    this.paymentService
      .createPayment(paymentData)
      .subscribe({
        next: payment => {
          this.isSaving = false;

          this.notificationService.success(
            'Payment recorded successfully.'
          );

          this.router.navigate([
            '/payments',
            payment.id
          ]);
        },

        error: error => {
          this.isSaving = false;
          this.errorMessage = 'Unable to save payment.';

          console.error('Failed to save payment:', error);

          this.notificationService.error(
            error?.error?.message ||
            'Unable to save payment. Please try again.'
          );
        }
      });
  }

  cancel(): void {
    this.router.navigate(['/payments']);
  }

  private getToday(): string {
    return new Date()
      .toISOString()
      .split('T')[0];
  }
}