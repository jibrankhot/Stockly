
import {
  CommonModule,
  DatePipe,
  DecimalPipe
} from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  Payment,
  PaymentMethod
} from '../../../../shared/models/payment';
import { ModalService } from '../../../../core/services/modal.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { PaymentService } from '../../services/payment.service';

@Component({
  selector: 'app-payment-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    FormsModule,
    RouterLink
  ],
  templateUrl: './payment-list.component.html',
  styleUrl: './payment-list.component.scss'
})
export class PaymentListComponent implements OnInit {
  payments: Payment[] = [];
  filteredPayments: Payment[] = [];

  searchTerm = '';
  methodFilter: PaymentMethod | 'all' = 'all';

  isLoading = true;
  isDeleting = false;
  deletingPaymentId: number | null = null;
  errorMessage = '';

  readonly paymentMethods: PaymentMethod[] = [
    'Cash',
    'Card',
    'UPI',
    'Bank Transfer',
    'Cheque',
    'Other'
  ];

  constructor(
    private readonly paymentService: PaymentService,
    private readonly modalService: ModalService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService.getPayments().subscribe({
      next: payments => {
        this.payments = [...payments].sort((a, b) => {
          const dateComparison =
            b.paymentDate.localeCompare(a.paymentDate);

          return dateComparison !== 0
            ? dateComparison
            : b.id - a.id;
        });

        this.applyFilters();
        this.isLoading = false;
      },
      error: error => {
        console.error('Failed to load payments:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to load payments. Please try again.';

        this.isLoading = false;

        this.notificationService.error(this.errorMessage);
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredPayments = this.payments.filter(payment => {
      const searchableValues = [
        payment.paymentNumber,
        payment.invoiceNumber,
        payment.customerName,
        payment.referenceNumber,
        payment.paymentMethod,
        this.getMethodLabel(payment.paymentMethod),
        payment.notes
      ];

      const matchesSearch =
        !search ||
        searchableValues.some(value =>
          String(value ?? '').toLowerCase().includes(search)
        );

      const matchesMethod =
        this.methodFilter === 'all' ||
        payment.paymentMethod === this.methodFilter;

      return matchesSearch && matchesMethod;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.methodFilter = 'all';
    this.applyFilters();
  }

  get hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.methodFilter !== 'all'
    );
  }



  // Replace deletePayment() with this method.
  deletePayment(payment: Payment): void {
    if (this.isDeleting) {
      return;
    }

    this.modalService
      .open(
        'Delete Payment?',
        `Are you sure you want to delete payment "${payment.paymentNumber}"? This will also recalculate the related invoice balance.`,
        'Delete Payment',
        'Cancel',
        'danger'
      )
      .subscribe(confirmed => {
        if (!confirmed || this.isDeleting) {
          return;
        }

        this.isDeleting = true;
        this.deletingPaymentId = payment.id;

        this.paymentService
          .deletePayment(payment.id)
          .pipe(
            finalize(() => {
              this.isDeleting = false;
              this.deletingPaymentId = null;
            })
          )
          .subscribe({
            next: deleted => {
              if (!deleted) {
                this.notificationService.error(
                  'Payment could not be deleted.'
                );
                return;
              }

              this.payments = this.payments.filter(
                item => item.id !== payment.id
              );

              this.applyFilters();

              this.notificationService.success(
                `Payment "${payment.paymentNumber}" deleted successfully.`
              );
            },
            error: error => {
              console.error('Failed to delete payment:', error);

              this.notificationService.error(
                error?.error?.message ||
                'Failed to delete payment. Please try again.'
              );
            }
          });
      });
  }


  getMethodLabel(method: PaymentMethod): string {
    const labels: Record<PaymentMethod, string> = {
      Cash: 'Cash',
      Card: 'Card',
      UPI: 'UPI',
      'Bank Transfer': 'Bank Transfer',
      Cheque: 'Cheque',
      Other: 'Other'
    };

    return labels[method] ?? method;
  }

  getMethodClass(method: PaymentMethod): string {
    const classes: Record<PaymentMethod, string> = {
      Cash: 'method-cash',
      Card: 'method-card',
      UPI: 'method-upi',
      'Bank Transfer': 'method-bank-transfer',
      Cheque: 'method-cheque',
      Other: 'method-other'
    };

    return classes[method] ?? 'method-other';
  }

  get totalPaymentAmount(): number {
    return this.payments.reduce(
      (total, payment) => total + payment.amount,
      0
    );
  }

  get totalPayments(): number {
    return this.payments.length;
  }

  get averagePayment(): number {
    return this.totalPayments
      ? this.totalPaymentAmount / this.totalPayments
      : 0;
  }

  trackByPaymentId(
    _index: number,
    payment: Payment
  ): number {
    return payment.id;
  }
}
