import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Product } from '../../../../shared/models/product';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductService } from '../../services/product.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';

@Component({
  selector: 'app-product-edit',
  standalone: true,
  imports: [ProductFormComponent],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss'
})
export class ProductEditComponent implements OnInit {
  product: Product | null = null;
  isLoading = false;
  isSubmitting = false;

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly productService: ProductService,
    private readonly router: Router,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    const productId = Number(
      this.activatedRoute.snapshot.paramMap.get('id')
    );

    if (!Number.isInteger(productId) || productId <= 0) {
      this.product = null;
      return;
    }

    this.loadProduct(productId);
  }

  loadProduct(id: number): void {
    this.isLoading = true;

    this.productService
      .getProductById(id)
      .pipe(
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: product => {
          this.product = product;
        },
        error: error => {
          console.error('Failed to load product:', error);
          this.product = null;
        }
      });
  }

  onSubmit(productData: Partial<Product>): void {
    if (!this.product || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.productService
      .updateProduct(this.product.id, productData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        })
      )
      .subscribe({
        next: updatedProduct => {
          if (!updatedProduct) {
            this.notificationService.error(
              'Product could not be updated.'
            );
            return;
          }

          this.notificationService.success(
            'Product updated successfully.'
          );

          this.router.navigate(['/products']);
        },
        error: error => {
          console.error('Failed to update product:', error);
        }
      });
  }

  onCancel(): void {
    if (this.isSubmitting) {
      return;
    }

    if (!this.product) {
      this.router.navigate(['/products']);
      return;
    }

    this.router.navigate(['/products', this.product.id]);
  }

  goBack(): void {
    this.router.navigate(['/products']);
  }
}