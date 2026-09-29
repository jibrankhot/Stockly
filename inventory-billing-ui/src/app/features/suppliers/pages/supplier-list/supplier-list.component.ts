
import { Component, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { Supplier } from '../../../../shared/models/supplier';
import { SupplierService } from '../../services/supplier.service';
import { ModalService } from '../../../../core/services/modal.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink
  ],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss'
})
export class SupplierListComponent implements OnInit {

  suppliers: Supplier[] = [];

  searchTerm = '';

  selectedStatus = 'all';

  isLoading = false;

  constructor(
    private readonly supplierService: SupplierService,
    private readonly router: Router,
    private readonly modalService: ModalService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  get filteredSuppliers(): Supplier[] {
    const search = this.searchTerm
      .trim()
      .toLowerCase();

    return this.suppliers.filter(supplier => {

      const matchesSearch =
        !search ||
        (supplier.name ?? '').toLowerCase().includes(search) ||
        (supplier.code ?? '').toLowerCase().includes(search) ||
        (supplier.email ?? '').toLowerCase().includes(search) ||
        (supplier.phone ?? '').toLowerCase().includes(search) ||
        (supplier.city ?? '').toLowerCase().includes(search) ||
        (supplier.state ?? '').toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && supplier.isActive) ||
        (this.selectedStatus === 'inactive' && !supplier.isActive);

      return matchesSearch && matchesStatus;
    });
  }

  loadSuppliers(): void {
    this.isLoading = true;

    this.supplierService.getSuppliers().subscribe({
      next: suppliers => {
        this.suppliers = suppliers;
        this.isLoading = false;
      },

      error: error => {
        console.error(
          'Failed to load suppliers:',
          error
        );

        this.isLoading = false;

        this.notificationService.error(
          error?.error?.message ||
          'Failed to load suppliers. Please try again.'
        );
      }
    });
  }

  viewSupplier(supplier: Supplier): void {
    this.router.navigate([
      '/suppliers',
      supplier.id
    ]);
  }

  editSupplier(supplier: Supplier): void {
    this.router.navigate([
      '/suppliers',
      supplier.id,
      'edit'
    ]);
  }

  deleteSupplier(supplier: Supplier): void {
    this.modalService
      .open(
        'Delete Supplier?',
        `Are you sure you want to delete "${supplier.name}"?`,
        'Delete Supplier',
        'Cancel',
        'danger'
      )
      .subscribe(confirmed => {

        if (!confirmed) {
          return;
        }

        this.supplierService
          .deleteSupplier(supplier.id)
          .subscribe({
            next: deleted => {

              if (!deleted) {
                this.notificationService.error(
                  'Supplier could not be deleted.'
                );

                return;
              }

              this.suppliers = this.suppliers.filter(
                item => item.id !== supplier.id
              );

              this.notificationService.success(
                'Supplier deleted successfully.'
              );
            },

            error: error => {
              console.error(
                'Failed to delete supplier:',
                error
              );

              this.notificationService.error(
                error?.error?.message ||
                'Failed to delete supplier. Please try again.'
              );
            }
          });
      });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
  }
}