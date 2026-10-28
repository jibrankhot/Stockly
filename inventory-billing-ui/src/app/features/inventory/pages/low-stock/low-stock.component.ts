
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { StockItem } from '../../../../shared/models/stock';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-low-stock',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './low-stock.component.html',
  styleUrl: './low-stock.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LowStockComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly cdr = inject(ChangeDetectorRef);

  stockItems: StockItem[] = [];
  filteredItems: StockItem[] = [];

  searchTerm = '';

  isLoading = false;
  errorMessage = '';

  readonly pageSizeOptions = [5, 10, 25, 50];

  pageSize = 5;
  currentPage = 1;

  ngOnInit(): void {
    this.loadLowStockItems();
  }

  // =========================================================
  // LOAD STOCK ALERTS
  // =========================================================

  loadLowStockItems(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.cdr.markForCheck();

    this.inventoryService
      .getLowStockItems()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (items) => {
          this.stockItems = Array.isArray(items) ? items : [];
          this.applyFilter();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load low stock items:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to load low stock items. Please try again.';

          this.stockItems = [];
          this.filteredItems = [];
          this.currentPage = 1;
          this.cdr.markForCheck();
        },
      });
  }

  // =========================================================
  // SEARCH
  // =========================================================

  applyFilter(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredItems = this.stockItems.filter((item) => {
      const productName = String(item.productName ?? '').toLowerCase();
      const sku = String(item.sku ?? '').toLowerCase();

      return (
        !search ||
        productName.includes(search) ||
        sku.includes(search)
      );
    });

    // Reset pagination when search results change.
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.applyFilter();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim().length > 0;
  }

  // =========================================================
  // PAGINATION
  // =========================================================

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredItems.length / this.pageSize),
    );
  }

  get paginatedItems(): StockItem[] {
    const start = (this.currentPage - 1) * this.pageSize;

    return this.filteredItems.slice(start, start + this.pageSize);
  }

  get paginationStart(): number {
    return this.filteredItems.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredItems.length,
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
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.cdr.markForCheck();
  }

  changePageSize(size: number): void {
    if (!this.pageSizeOptions.includes(Number(size))) {
      return;
    }

    this.pageSize = Number(size);
    this.currentPage = 1;
    this.cdr.markForCheck();
  }

  // =========================================================
  // SUMMARY CARDS
  // =========================================================

  get outOfStockItems(): StockItem[] {
    return this.stockItems.filter(
      (item) => item.status === 'out-of-stock',
    );
  }

  get lowStockItems(): StockItem[] {
    return this.stockItems.filter(
      (item) => item.status === 'low-stock',
    );
  }

  get totalAttentionNeeded(): number {
    return this.stockItems.filter(
      (item) =>
        item.status === 'low-stock' ||
        item.status === 'out-of-stock',
    ).length;
  }

  // =========================================================
  // STOCK STATUS
  // =========================================================

  getStatusLabel(status: StockItem['status']): string {
    switch (status) {
      case 'low-stock':
        return 'Low Stock';

      case 'out-of-stock':
        return 'Out of Stock';

      case 'in-stock':
        return 'In Stock';

      default:
        return status;
    }
  }

  getStatusClass(status: StockItem['status']): string {
    return `status-${status}`;
  }

  // =========================================================
  // TRACKING
  // =========================================================

  trackByStockItem(_index: number, item: StockItem): number {
    return item.id;
  }
}
