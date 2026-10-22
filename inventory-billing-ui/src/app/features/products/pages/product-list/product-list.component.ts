
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Product } from '../../../../shared/models/product';
import { Category } from '../../../../shared/models/category';

import { ProductService } from '../../services/product.service';
import { CategoryService } from '../../../categories/services/category.service';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [RouterLink, DecimalPipe, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {
  private readonly productService = inject(ProductService);
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  products: Product[] = [];
  categories: Category[] = [];

  searchTerm = '';
  selectedCategoryId: number | null = null;
  selectedStatus: 'all' | 'active' | 'inactive' = 'all';

  isLoading = false;
  isLoadingCategories = false;

  private readonly deletingProductIds = new Set<number>();

  // Pagination
  currentPage = 1;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  get filteredProducts(): Product[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.products.filter((product) => {
      const matchesSearch =
        !search ||
        (product.name ?? '').toLowerCase().includes(search) ||
        (product.sku ?? '').toLowerCase().includes(search);

      const matchesCategory =
        this.selectedCategoryId === null ||
        product.categoryId === this.selectedCategoryId;

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && product.isActive) ||
        (this.selectedStatus === 'inactive' && !product.isActive);

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredProducts.length / this.pageSize),
    );
  }

  get paginatedProducts(): Product[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    return this.filteredProducts.slice(
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
    if (this.filteredProducts.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredProducts.length,
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

  loadProducts(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.changeDetectorRef.markForCheck();

    this.productService
      .getProducts()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: (products) => {
          this.products = Array.isArray(products) ? products : [];
          this.currentPage = 1;
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          // The HTTP error interceptor handles notifications.
        },
      });
  }

  loadCategories(): void {
    this.isLoadingCategories = true;
    this.changeDetectorRef.markForCheck();

    this.categoryService
      .getCategories()
      .pipe(
        finalize(() => {
          this.isLoadingCategories = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: (categories) => {
          this.categories = (
            Array.isArray(categories) ? categories : []
          ).filter((category) => category.isActive);

          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          // The HTTP error interceptor handles notifications.
        },
      });
  }

  viewProduct(product: Product): void {
    void this.router.navigate(['/products', product.id]);
  }

  editProduct(product: Product): void {
    void this.router.navigate(['/products', product.id, 'edit']);
  }

  deleteProduct(product: Product): void {
    if (this.deletingProductIds.has(product.id)) {
      return;
    }

    this.modalService
      .open(
        'Delete Product?',
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
        'Delete Product',
        'Cancel',
        'danger',
      )
      .subscribe((confirmed) => {
        if (
          !confirmed ||
          this.deletingProductIds.has(product.id)
        ) {
          return;
        }

        this.deletingProductIds.add(product.id);
        this.changeDetectorRef.markForCheck();

        this.productService
          .deleteProduct(product.id)
          .pipe(
            finalize(() => {
              this.deletingProductIds.delete(product.id);
              this.changeDetectorRef.markForCheck();
            }),
          )
          .subscribe({
            next: () => {
              this.products = this.products.filter(
                (item) => item.id !== product.id,
              );

              // Prevent the current page from becoming invalid.
              this.currentPage = Math.min(
                this.currentPage,
                this.totalPages,
              );

              this.changeDetectorRef.markForCheck();
            },
            error: () => {
              // The HTTP error interceptor handles notifications.
            },
          });
      });
  }

  isDeleting(product: Product): boolean {
    return this.deletingProductIds.has(product.id);
  }

  isLowStock(product: Product): boolean {
    return product.currentStock <= product.minimumStock;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.selectedStatus = 'all';
    this.currentPage = 1;
    this.changeDetectorRef.markForCheck();
  }
}
