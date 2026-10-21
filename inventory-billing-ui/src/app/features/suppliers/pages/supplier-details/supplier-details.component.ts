
import { DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';

import { Supplier } from '../../../../shared/models/supplier';
import { SupplierService } from '../../services/supplier.service';

@Component({
  selector: 'app-supplier-details',
  standalone: true,
  imports: [DatePipe, RouterModule],
  templateUrl: './supplier-details.component.html',
  styleUrl: './supplier-details.component.scss'
})
export class SupplierDetailsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly supplierService = inject(SupplierService);
  private readonly destroyRef = inject(DestroyRef);

  supplier: Supplier | null = null;
  isLoading = false;
  errorMessage: string | null = null;

  // Public because the template uses this to decide whether to show Retry.
  supplierId: number | null = null;

  ngOnInit(): void {
    this.loadSupplier();
  }

  loadSupplier(): void {
    const rawId = this.route.snapshot.paramMap.get('id');
    const id = rawId === null ? NaN : Number(rawId);

    if (!Number.isSafeInteger(id) || id <= 0) {
      this.supplierId = null;
      this.supplier = null;
      this.isLoading = false;
      this.errorMessage =
        'The supplier ID is invalid. Return to the supplier list and select a supplier.';
      return;
    }

    this.supplierId = id;
    this.supplier = null;
    this.errorMessage = null;
    this.isLoading = true;

    this.supplierService
      .getSupplierById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (supplier) => {
          this.supplier = supplier;
          this.isLoading = false;

          if (!supplier) {
            this.errorMessage =
              'This supplier could not be found. It may have been deleted.';
          }
        },
        error: (error: unknown) => {
          console.error('Failed to load supplier details:', error);

          this.supplier = null;
          this.isLoading = false;
          this.errorMessage =
            'We could not load this supplier. Check your connection and try again.';
        }
      });
  }

  retryLoad(): void {
    if (this.supplierId === null || this.isLoading) {
      return;
    }

    this.loadSupplier();
  }

  editSupplier(): void {
    if (!this.supplier) {
      return;
    }

    void this.router.navigate([
      '/suppliers',
      this.supplier.id,
      'edit'
    ]);
  }

  goBack(): void {
    void this.router.navigate(['/suppliers']);
  }
}
