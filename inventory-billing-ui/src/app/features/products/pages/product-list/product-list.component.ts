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
  imports: [
    RouterLink,
    DecimalPipe,
    FormsModule,
  ],
  templateUrl: './product-list.component.html',
  styleUrl: './product-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductListComponent implements OnInit {

  private readonly productService =
    inject(ProductService);

  private readonly categoryService =
    inject(CategoryService);

  private readonly router =
    inject(Router);

  private readonly modalService =
    inject(ModalService);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

  products: Product[] = [];
  categories: Category[] = [];

  searchTerm = '';
  selectedCategoryId: number | null = null;
  selectedStatus = 'all';

  isLoading = false;
  isLoadingCategories = false;

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();
  }

  get filteredProducts(): Product[] {
    const search =
      this.searchTerm
        .trim()
        .toLowerCase();

    return this.products.filter((product) => {

      const matchesSearch =
        !search ||
        product.name
          .toLowerCase()
          .includes(search) ||
        product.sku
          .toLowerCase()
          .includes(search);

      const matchesCategory =
        this.selectedCategoryId === null ||
        product.categoryId ===
        this.selectedCategoryId;

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (
          this.selectedStatus === 'active' &&
          product.isActive
        ) ||
        (
          this.selectedStatus === 'inactive' &&
          !product.isActive
        );

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus
      );
    });
  }

  loadProducts(): void {
    this.isLoading = true;

    this.productService
      .getProducts()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (products) => {
          this.products = products;
          this.changeDetectorRef.markForCheck();
        },

        error: () => {
          // HTTP error interceptor handles
          // the error notification.
        },
      });
  }

  loadCategories(): void {
    this.isLoadingCategories = true;

    this.categoryService
      .getCategories()
      .pipe(
        finalize(() => {
          this.isLoadingCategories = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (categories) => {
          this.categories =
            categories.filter(
              (category) => category.isActive
            );

          this.changeDetectorRef.markForCheck();
        },

        error: () => {
          // HTTP error interceptor handles
          // the error notification.
        },
      });
  }

  viewProduct(product: Product): void {
    void this.router.navigate([
      '/products',
      product.id,
    ]);
  }

  editProduct(product: Product): void {
    void this.router.navigate([
      '/products',
      product.id,
      'edit',
    ]);
  }

  deleteProduct(product: Product): void {
    this.modalService
      .open(
        'Delete Product?',
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
        'Delete Product',
        'Cancel',
        'danger'
      )
      .subscribe((confirmed) => {

        if (!confirmed) {
          return;
        }

        this.productService
          .deleteProduct(product.id)
          .subscribe({
            next: () => {
              this.products =
                this.products.filter(
                  (item) =>
                    item.id !== product.id
                );

              this.changeDetectorRef
                .markForCheck();
            },

            error: () => {
              // HTTP error interceptor handles
              // the error notification.
            },
          });
      });
  }

  isLowStock(product: Product): boolean {
    return (
      product.currentStock <=
      product.minimumStock
    );
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategoryId = null;
    this.selectedStatus = 'all';

    this.changeDetectorRef.markForCheck();
  }
}