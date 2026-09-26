
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Product } from '../../../../shared/models/product';
import { ProductService } from '../../services/product.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { NotificationService } from '../../../../core/services/notification.service';

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

    this.productService.getProductById(id).subscribe({
      next: product => {
        this.product = product;
        this.isLoading = false;
      },
      error: error => {
        console.error('Failed to load product:', error);
        this.product = null;
        this.isLoading = false;
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
      .subscribe({
        next: updatedProduct => {
          this.isSubmitting = false;

          if (!updatedProduct) {
            this.notificationService.error(
              'Product could not be updated.',
              10000
            );
            return;
          }

          this.notificationService.success(
            'Product updated successfully.',
            10000
          );

          this.router.navigate(['/products']);
        },
        error: error => {
          console.error('Failed to update product:', error);

          this.isSubmitting = false;

          this.notificationService.error(
            'Failed to update product. Please try again.',
            10000
          );
        }
      });
  }

  onCancel(): void {
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