
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Supplier } from '../../../../shared/models/supplier';
import { SupplierService } from '../../services/supplier.service';
import { ModalService } from '../../../../core/services/modal.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-supplier-list',
  standalone: true,
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './supplier-list.component.html',
  styleUrl: './supplier-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SupplierListComponent implements OnInit {
  private readonly supplierService = inject(SupplierService);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly notificationService = inject(NotificationService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  suppliers: Supplier[] = [];

  searchTerm = '';
  selectedStatus: 'all' | 'active' | 'inactive' = 'all';

  isLoading = false;
  hasLoadError = false;

  private readonly deletingSupplierIds = new Set<number>();

  // Pagination
  currentPage = 1;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.loadSuppliers();
  }

  get filteredSuppliers(): Supplier[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.suppliers.filter((supplier) => {
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

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredSuppliers.length / this.pageSize),
    );
  }

  get paginatedSuppliers(): Supplier[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    return this.filteredSuppliers.slice(
      startIndex,
      startIndex + this.pageSize,
    );
  }

  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1,
    );
  }

  get paginationStart(): number {
    if (this.filteredSuppliers.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredSuppliers.length,
    );
  }

  changePageSize(size: number): void {
    if (!this.pageSizeOptions.includes(size)) {
      return;
    }

    this.pageSize = size;
    this.currentPage = 1;
    this.changeDetectorRef.markForCheck();
  }

  goToPage(page: number): void {
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;
    this.changeDetectorRef.markForCheck();
  }

  onFiltersChanged(): void {
    this.currentPage = 1;
    this.changeDetectorRef.markForCheck();
  }

  loadSuppliers(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.hasLoadError = false;
    this.changeDetectorRef.markForCheck();

    this.supplierService
      .getSuppliers()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: (suppliers) => {
          this.suppliers = Array.isArray(suppliers) ? suppliers : [];
          this.currentPage = 1;
          this.hasLoadError = false;
          this.changeDetectorRef.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load suppliers:', error);
          this.hasLoadError = true;

          this.notificationService.error(
            error?.error?.message ||
            'Failed to load suppliers. Please try again.',
          );

          this.changeDetectorRef.markForCheck();
        },
      });
  }

  viewSupplier(supplier: Supplier): void {
    void this.router.navigate(['/suppliers', supplier.id]);
  }

  editSupplier(supplier: Supplier): void {
    void this.router.navigate([
      '/suppliers',
      supplier.id,
      'edit',
    ]);
  }

  deleteSupplier(supplier: Supplier): void {
    if (this.deletingSupplierIds.has(supplier.id)) {
      return;
    }

    this.modalService
      .open(
        'Delete Supplier?',
        `Are you sure you want to delete "${supplier.name}"?`,
        'Delete Supplier',
        'Cancel',
        'danger',
      )
      .subscribe((confirmed) => {
        if (
          !confirmed ||
          this.deletingSupplierIds.has(supplier.id)
        ) {
          return;
        }

        this.deletingSupplierIds.add(supplier.id);
        this.changeDetectorRef.markForCheck();

        this.supplierService
          .deleteSupplier(supplier.id)
          .pipe(
            finalize(() => {
              this.deletingSupplierIds.delete(supplier.id);
              this.changeDetectorRef.markForCheck();
            }),
          )
          .subscribe({
            next: (deleted) => {
              if (!deleted) {
                this.notificationService.error(
                  'Supplier could not be deleted.',
                );
                return;
              }

              this.suppliers = this.suppliers.filter(
                (item) => item.id !== supplier.id,
              );

              this.currentPage = Math.min(
                this.currentPage,
                this.totalPages,
              );

              this.notificationService.success(
                'Supplier deleted successfully.',
              );

              this.changeDetectorRef.markForCheck();
            },
            error: (error) => {
              console.error('Failed to delete supplier:', error);

              this.notificationService.error(
                error?.error?.message ||
                'Failed to delete supplier. Please try again.',
              );

              this.changeDetectorRef.markForCheck();
            },
          });
      });
  }

  isDeleting(supplier: Supplier): boolean {
    return this.deletingSupplierIds.has(supplier.id);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.currentPage = 1;
    this.changeDetectorRef.markForCheck();
  }
}
