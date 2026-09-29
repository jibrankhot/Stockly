
import {
  CommonModule,
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  Component,
  OnInit
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  Payment,
  PaymentMethod
} from '../../../../shared/models/payment';

import { PaymentService } from '../../services/payment.service';
import { ModalService } from '../../../../core/services/modal.service';
import { NotificationService } from '../../../../core/services/notification.service';

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
  methodFilter = 'all';

  isLoading = true;
  errorMessage = '';

  constructor(
    private paymentService: PaymentService,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadPayments();
  }

  loadPayments(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.paymentService
      .getPayments()
      .subscribe({
        next: payments => {
          this.payments = payments;
          this.applyFilters();
          this.isLoading = false;
        },

        error: error => {
          this.errorMessage = 'Unable to load payments.';
          this.isLoading = false;

          console.error(
            'Failed to load payments:',
            error
          );

          this.notificationService.error(
            error?.error?.message ||
            'Unable to load payments. Please try again.'
          );
        }
      });
  }

  applyFilters(): void {
    const search = this.searchTerm
      .trim()
      .toLowerCase();

    this.filteredPayments = this.payments.filter(payment => {

      const matchesSearch =
        !search ||
        payment.paymentNumber
          .toLowerCase()
          .includes(search) ||
        payment.invoiceNumber
          .toLowerCase()
          .includes(search) ||
        payment.customerName
          .toLowerCase()
          .includes(search) ||
        payment.referenceNumber
          .toLowerCase()
          .includes(search);

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

  deletePayment(payment: Payment): void {
    this.modalService
      .open(
        'Delete Payment?',
        `Are you sure you want to delete payment "${payment.paymentNumber}"?`,
        'Delete Payment',
        'Cancel',
        'danger'
      )
      .subscribe(confirmed => {

        if (!confirmed) {
          return;
        }

        this.paymentService
          .deletePayment(payment.id)
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
                'Payment deleted successfully.'
              );
            },

            error: error => {
              console.error(
                'Failed to delete payment:',
                error
              );

              this.notificationService.error(
                error?.error?.message ||
                'Failed to delete payment. Please try again.'
              );
            }
          });
      });
  }

  getMethodLabel(method: PaymentMethod): string {
    switch (method) {
      case 'cash':
        return 'Cash';

      case 'bank-transfer':
        return 'Bank Transfer';

      case 'upi':
        return 'UPI';

      case 'card':
        return 'Card';

      case 'cheque':
        return 'Cheque';

      default:
        return method;
    }
  }

  getMethodClass(method: PaymentMethod): string {
    return `method-${method}`;
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
    if (this.payments.length === 0) {
      return 0;
    }

    return this.totalPaymentAmount / this.payments.length;
  }
}