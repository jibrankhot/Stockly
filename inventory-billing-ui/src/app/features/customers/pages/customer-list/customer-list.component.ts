
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../../../shared/models/customer';
import { ModalService } from '../../../../core/services/modal.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    RouterLink,
    FormsModule
  ],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent implements OnInit {

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];

  searchTerm = '';
  statusFilter = 'all';

  isLoading = false;
  errorMessage = '';
  isDeletingCustomerId: number | null = null;

  constructor(
    private readonly customerService: CustomerService,
    private readonly modalService: ModalService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.customerService
      .getCustomers()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: customers => {
          this.customers = customers ?? [];
          this.applyFilters();
        },
        error: () => {
          this.errorMessage = 'Unable to load customers.';

          this.notificationService.error(
            this.errorMessage
          );
        }
      });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredCustomers = this.customers.filter(customer => {
      const matchesSearch =
        !search ||
        customer.code.toLowerCase().includes(search) ||
        customer.name.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search);

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && customer.isActive) ||
        (this.statusFilter === 'inactive' && !customer.isActive);

      return matchesSearch && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';

    this.applyFilters();
  }

  deleteCustomer(customer: Customer): void {
    if (this.isDeletingCustomerId !== null) {
      return;
    }

    this.modalService
      .open(
        'Delete Customer?',
        `Are you sure you want to delete "${customer.name}"? This action cannot be undone.`,
        'Delete Customer',
        'Cancel',
        'danger'
      )
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.performDelete(customer);
      });
  }

  private performDelete(customer: Customer): void {
    if (this.isDeletingCustomerId !== null) {
      return;
    }

    this.isDeletingCustomerId = customer.id;
    this.errorMessage = '';

    this.customerService
      .deleteCustomer(customer.id)
      .pipe(
        finalize(() => {
          this.isDeletingCustomerId = null;
        })
      )
      .subscribe({
        next: success => {
          if (!success) {
            this.errorMessage =
              'Unable to delete customer.';

            this.notificationService.error(
              this.errorMessage
            );
            return;
          }

          this.customers = this.customers.filter(
            item => item.id !== customer.id
          );

          this.applyFilters();

          this.notificationService.success(
            'Customer deleted successfully.'
          );
        },
        error: () => {
          this.errorMessage =
            'Unable to delete customer.';

          this.notificationService.error(
            this.errorMessage
          );
        }
      });
  }

  get activeCustomerCount(): number {
    return this.customers.filter(
      customer => customer.isActive
    ).length;
  }

  get inactiveCustomerCount(): number {
    return this.customers.filter(
      customer => !customer.isActive
    ).length;
  }

  get totalCustomerCount(): number {
    return this.customers.length;
  }
}