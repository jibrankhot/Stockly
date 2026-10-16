
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Product } from '../../../../shared/models/product';
import { NotificationService } from '../../../../core/services/notification.service';
import { ProductFormComponent } from '../../components/product-form/product-form.component';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [ProductFormComponent],
  templateUrl: './product-create.component.html',
  styleUrl: './product-create.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCreateComponent {
  private readonly productService = inject(ProductService);
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  isSubmitting = false;

  onSubmit(productData: Partial<Product>): void {
    if (this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    this.productService
      .createProduct(productData)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (product) => {
          if (!product) {
            this.notificationService.error(
              'Product could not be created. Please try again.'
            );
            return;
          }

          this.notificationService.success(
            `Product "${product.name}" created successfully.`
          );

          void this.router.navigate(['/products']);
        },

        error: () => {
          this.notificationService.error(
            'Failed to create product. Please check your details and try again.'
          );
        },
      });
  }

  onCancel(): void {
    if (this.isSubmitting) {
      return;
    }

    void this.router.navigate(['/products']);
  }
}
