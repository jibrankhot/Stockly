
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import {
  StockMovement,
  StockMovementType
} from '../../../../shared/models/stock';

import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-stock-movements',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    RouterLink
  ],
  templateUrl: './stock-movements.component.html',
  styleUrl: './stock-movements.component.scss'
})
export class StockMovementsComponent implements OnInit {
  movements: StockMovement[] = [];
  filteredMovements: StockMovement[] = [];
  paginatedMovements: StockMovement[] = [];

  searchTerm = '';
  typeFilter = 'all';

  isLoading = true;
  errorMessage = '';

  // Pagination
  pageSizeOptions = [5, 10, 25, 50];
  pageSize = 5;
  currentPage = 1;

  constructor(
    private inventoryService: InventoryService
  ) { }

  ngOnInit(): void {
    this.loadMovements();
  }

  loadMovements(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.inventoryService.getStockMovements().subscribe({
      next: (movements) => {
        this.movements = movements ?? [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load stock movements.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredMovements = this.movements.filter((movement) => {
      const matchesSearch =
        !search ||
        (movement.productName ?? '').toLowerCase().includes(search) ||
        (movement.sku ?? '').toLowerCase().includes(search) ||
        (movement.reference ?? '').toLowerCase().includes(search) ||
        (movement.notes ?? '').toLowerCase().includes(search) ||
        this.getTypeLabel(movement.type).toLowerCase().includes(search);

      const matchesType =
        this.typeFilter === 'all' ||
        movement.type === this.typeFilter;

      return matchesSearch && matchesType;
    });

    // Return to the first page whenever filters change.
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.typeFilter = 'all';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.typeFilter !== 'all'
    );
  }

  updatePagination(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    this.paginatedMovements = this.filteredMovements.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  changePageSize(size: number | string): void {
    const parsedSize = Number(size);

    if (!this.pageSizeOptions.includes(parsedSize)) {
      return;
    }

    this.pageSize = parsedSize;
    this.currentPage = 1;
    this.updatePagination();
  }

  goToPage(page: number): void {
    if (!Number.isFinite(page)) {
      return;
    }

    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredMovements.length / this.pageSize)
    );
  }

  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  get paginationStart(): number {
    if (this.filteredMovements.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredMovements.length
    );
  }

  getTypeLabel(type: StockMovementType): string {
    switch (type) {
      case 'purchase':
        return 'Purchase';
      case 'sale':
        return 'Sale';
      case 'adjustment':
        return 'Adjustment';
      case 'return':
        return 'Return';
      default:
        return type;
    }
  }

  getTypeClass(type: StockMovementType): string {
    return `movement-${type}`;
  }

  trackByMovement(
    index: number,
    movement: StockMovement
  ): string | number {
    const record = movement as StockMovement & {
      id?: string | number;
      _id?: string | number;
    };

    return record.id ?? record._id ?? `${movement.reference}-${index}`;
  }

  get totalMovements(): number {
    return this.movements.length;
  }

  get incomingQuantity(): number {
    return this.movements
      .filter(movement => movement.quantity > 0)
      .reduce(
        (total, movement) => total + movement.quantity,
        0
      );
  }

  get outgoingQuantity(): number {
    return Math.abs(
      this.movements
        .filter(movement => movement.quantity < 0)
        .reduce(
          (total, movement) => total + movement.quantity,
          0
        )
    );
  }
}
