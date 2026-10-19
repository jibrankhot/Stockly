
import {
  CommonModule,
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import {
  Payment,
  PaymentMethod
} from '../../../../shared/models/payment';

import { PaymentService } from '../../services/payment.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-payment-details',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './payment-details.component.html',
  styleUrl: './payment-details.component.scss'
})
export class PaymentDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentService = inject(PaymentService);
  private readonly notificationService = inject(NotificationService);

  payment: Payment | null = null;

  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadPayment();
  }

  loadPayment(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.payment = null;

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (
      !idParam ||
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      this.errorMessage = 'Invalid payment ID.';
      this.isLoading = false;

      this.notificationService.error(this.errorMessage);
      return;
    }

    this.paymentService.getPaymentById(id).subscribe({
      next: payment => {
        if (!payment) {
          this.errorMessage = 'Payment not found.';
          this.notificationService.error(this.errorMessage);
        } else {
          this.payment = payment;
        }

        this.isLoading = false;
      },

      error: error => {
        console.error('Failed to load payment:', error);

        this.errorMessage =
          error?.error?.message ||
          'Unable to load payment. Please try again.';

        this.isLoading = false;
        this.notificationService.error(this.errorMessage);
      }
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
}
