
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule, DecimalPipe, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import {
  StockItem,
  StockStatus,
} from '../../../../shared/models/stock';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-stock-overview',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    CurrencyPipe,
    RouterLink,
    FormsModule,
  ],
  templateUrl: './stock-overview.component.html',
  styleUrl: './stock-overview.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockOverviewComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly cdr = inject(ChangeDetectorRef);

  stockItems: StockItem[] = [];
  filteredStockItems: StockItem[] = [];

  searchTerm = '';
  statusFilter: StockStatus | 'all' = 'all';

  isLoading = false;
  errorMessage = '';

  readonly pageSizeOptions = [5, 10, 25, 50];

  pageSize = 5;
  currentPage = 1;

  ngOnInit(): void {
    this.loadStock();
  }

  // =========================================================
  // LOAD STOCK
  // =========================================================

  loadStock(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.inventoryService
      .getStockItems()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.stockItems = Array.isArray(items) ? items : [];
          this.applyFilters();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load stock information:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to load stock information. Please try again.';

          this.cdr.markForCheck();
        },
      });
  }

  // =========================================================
  // SEARCH AND FILTERS
  // =========================================================

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredStockItems = this.stockItems.filter((item) => {
      const productName = String(item.productName ?? '').toLowerCase();
      const sku = String(item.sku ?? '').toLowerCase();

      const matchesSearch =
        !search ||
        productName.includes(search) ||
        sku.includes(search);

      const matchesStatus =
        this.statusFilter === 'all' ||
        item.status === this.statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Return to the first page whenever filters change.
    this.currentPage = 1;

    this.cdr.markForCheck();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  /**
   * Used by the HTML template to enable or disable
   * the Clear filters button.
   */
  hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.statusFilter !== 'all'
    );
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredStockItems.length / this.pageSize),
    );
  }

  get paginatedStockItems(): StockItem[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredStockItems.slice(
      start,
      start + this.pageSize,
    );
  }

  get paginationStart(): number {
    if (this.filteredStockItems.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredStockItems.length,
    );
  }

  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1,
    );
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
    this.cdr.markForCheck();
  }

  changePageSize(size: number): void {
    if (!this.pageSizeOptions.includes(size)) {
      return;
    }

    this.pageSize = size;
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  // =========================================================
  // STOCK STATUS
  // =========================================================

  getStatusLabel(status: StockStatus): string {
    switch (status) {
      case 'in-stock':
        return 'In Stock';

      case 'low-stock':
        return 'Low Stock';

      case 'out-of-stock':
        return 'Out of Stock';

      default:
        return status;
    }
  }

  getStatusClass(status: StockStatus): string {
    // Produces:
    // status-in-stock
    // status-low-stock
    // status-out-of-stock
    return `status-${status}`;
  }

  // =========================================================
  // SUMMARY CARDS
  // =========================================================

  get totalProducts(): number {
    return this.stockItems.length;
  }

  get totalQuantity(): number {
    return this.stockItems.reduce(
      (total, item) => total + (Number(item.quantity) || 0),
      0,
    );
  }

  get totalStockValue(): number {
    return this.stockItems.reduce(
      (total, item) => total + (Number(item.stockValue) || 0),
      0,
    );
  }

  get lowStockCount(): number {
    return this.stockItems.filter(
      (item) => item.status === 'low-stock',
    ).length;
  }

  get outOfStockCount(): number {
    return this.stockItems.filter(
      (item) => item.status === 'out-of-stock',
    ).length;
  }

  // =========================================================
  // TRACKING
  // =========================================================

  trackByStockItem(_index: number, item: StockItem): number {
    return item.id;
  }
}
