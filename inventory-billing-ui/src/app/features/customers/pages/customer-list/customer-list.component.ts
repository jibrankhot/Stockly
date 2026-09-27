
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../../../shared/models/customer';
import { ModalService } from '../../../../core/services/modal.service';

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

  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly customerService: CustomerService,
    private readonly modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.getCustomers().subscribe({
      next: customers => {
        this.customers = customers;
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load customers.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm
      .trim()
      .toLowerCase();

    this.filteredCustomers = this.customers.filter(
      customer => {
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
      }
    );
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';

    this.applyFilters();
  }

  deleteCustomer(customer: Customer): void {
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

        this.customerService
          .deleteCustomer(customer.id)
          .subscribe({
            next: () => {
              this.loadCustomers();
            },
            error: () => {
              this.errorMessage =
                'Unable to delete customer.';
            }
          });
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