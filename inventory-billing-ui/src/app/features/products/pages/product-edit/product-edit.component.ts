
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Product } from '../../../../shared/models/product';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [ProductFormComponent],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss'
})
export class ProductEditComponent implements OnInit {
  @ViewChild(ProductFormComponent)
  private productFormComponent?: ProductFormComponent;

  product: Product | null = null;
  productId: number | null = null;

  isLoading = false;
  isSubmitting = false;
  hasLoadError = false;
  isInvalidProductId = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const id = Number(this.activatedRoute.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.isInvalidProductId = true;
      return;
    }

    this.productId = id;
    this.loadProduct(id);
  }

  loadProduct(id: number): void {
    this.isLoading = true;
    this.hasLoadError = false;
    this.product = null;

    this.productService
      .getProductById(id)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (product) => {
          if (!product) {
            this.hasLoadError = true;
            this.notificationService.error(
              'Product could not be loaded. Please try again.'
            );
            return;
          }

          this.product = product;
        },
        error: (error) => {
          console.error('Failed to load product:', error);

          this.hasLoadError = true;

          if (error?.status === 404) {
            this.notificationService.error('Product not found.');
          } else {
            this.notificationService.error(
              'Failed to load product. Please try again.'
            );
          }
        }
      });
  }

  retryLoad(): void {
    if (this.productId === null || this.isLoading) {
      return;
    }

    this.loadProduct(this.productId);
  }

  onSubmit(productData: Partial<Product>): void {
    if (!this.product || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.productService
      .updateProduct(this.product.id, productData)
      .pipe(finalize(() => (this.isSubmitting = false)))
      .subscribe({
        next: (updatedProduct) => {
          if (!updatedProduct) {
            this.notificationService.error(
              'Product could not be updated. Please try again.'
            );
            return;
          }

          this.notificationService.success(
            'Product updated successfully.'
          );

          void this.router.navigate(['/products']);
        },
        error: (error) => {
          console.error('Failed to update product:', error);

          this.notificationService.error(
            'Failed to update product. Please try again.'
          );
        }
      });
  }

  onHeaderBack(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.productFormComponent) {
      // Reuse the form's unsaved-changes confirmation.
      this.productFormComponent.onCancel();
      return;
    }

    this.goBack();
  }

  onCancel(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.product) {
      void this.router.navigate(['/products', this.product.id]);
      return;
    }

    this.goBack();
  }

  goBack(): void {
    void this.router.navigate(['/products']);
  }
}
