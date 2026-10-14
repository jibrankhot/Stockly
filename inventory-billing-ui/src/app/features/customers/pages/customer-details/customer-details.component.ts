
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../../../shared/models/customer';
import { ModalService } from '../../../../core/services/modal.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-customer-details',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink],
  templateUrl: './customer-details.component.html',
  styleUrl: './customer-details.component.scss'
})
export class CustomerDetailsComponent implements OnInit {
  customer: Customer | null = null;
  customerId = 0;

  isLoading = true;
  isDeleting = false;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly customerService: CustomerService,
    private readonly modalService: ModalService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.errorMessage = 'The customer ID is invalid.';
      this.isLoading = false;
      return;
    }

    this.customerId = id;
    this.loadCustomer();
  }

  loadCustomer(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService
      .getCustomerById(this.customerId)
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe({
        next: (customer) => {
          this.customer = customer ?? null;

          if (!customer) {
            this.errorMessage = 'We could not find this customer.';
          }
        },
        error: () => {
          this.customer = null;
          this.errorMessage = 'Unable to load customer details. Please try again.';
          this.notificationService.error(this.errorMessage);
        }
      });
  }

  deleteCustomer(): void {
    const customer = this.customer;

    if (!customer || this.isDeleting || this.isLoading) {
      return;
    }

    this.modalService
      .open(
        'Delete customer?',
        `Are you sure you want to delete "${customer.name}"? This action cannot be undone.`,
        'Delete customer',
        'Cancel',
        'danger'
      )
      .subscribe((confirmed) => {
        if (!confirmed || this.isDeleting || !this.customer) {
          return;
        }

        this.isDeleting = true;
        this.errorMessage = '';

        this.customerService
          .deleteCustomer(customer.id)
          .pipe(finalize(() => {
            this.isDeleting = false;
          }))
          .subscribe({
            next: () => {
              this.notificationService.success(
                'Customer deleted successfully.'
              );

              void this.router.navigate(['/customers']);
            },
            error: () => {
              this.errorMessage =
                'Unable to delete this customer. Please try again.';

              this.notificationService.error(this.errorMessage);
            }
          });
      });
  }

  editCustomer(): void {
    if (!this.customer || this.isDeleting) {
      return;
    }

    void this.router.navigate([
      '/customers',
      this.customer.id,
      'edit'
    ]);
  }

  get customerInitials(): string {
    const name = this.customer?.name?.trim();

    if (!name) {
      return 'C';
    }

    return name
      .split(/\s+/)
      .slice(0, 2)
      .map(part => part.charAt(0).toUpperCase())
      .join('');
  }

  get formattedLocation(): string {
    if (!this.customer) {
      return '';
    }

    return [
      this.customer.city,
      this.customer.state,
      this.customer.postalCode
    ]
      .filter(value => Boolean(value?.trim()))
      .join(', ');
  }
}
