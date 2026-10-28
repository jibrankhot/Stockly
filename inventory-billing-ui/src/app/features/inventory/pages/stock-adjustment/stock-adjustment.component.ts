
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { StockItem } from '../../../../shared/models/stock';
import { InventoryService } from '../../services/inventory.service';

@Component({
  selector: 'app-stock-adjustment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './stock-adjustment.component.html',
  styleUrl: './stock-adjustment.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockAdjustmentComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly router = inject(Router);
  private readonly cdr = inject(ChangeDetectorRef);

  stockItems: StockItem[] = [];
  selectedItem: StockItem | null = null;

  isLoading = false;
  isSaving = false;

  errorMessage = '';
  successMessage = '';

  readonly adjustmentForm: FormGroup = this.fb.group({
    productId: ['', Validators.required],
    adjustmentType: ['add', Validators.required],
    quantity: [
      1,
      [
        Validators.required,
        Validators.min(1),
      ],
    ],
    reference: ['', Validators.maxLength(50)],
    notes: ['', Validators.maxLength(250)],
  });

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
          this.onProductChange();
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to load stock items:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to load stock items. Please try again.';

          this.cdr.markForCheck();
        },
      });
  }

  // =========================================================
  // PRODUCT SELECTION
  // =========================================================

  onProductChange(): void {
    const productId = Number(
      this.adjustmentForm.get('productId')?.value,
    );

    this.selectedItem = productId
      ? this.stockItems.find(
        (item) => Number(item.productId) === productId,
      ) ?? null
      : null;

    this.cdr.markForCheck();
  }

  // =========================================================
  // STOCK PREVIEW
  // =========================================================

  get adjustedQuantity(): number {
    if (!this.selectedItem) {
      return 0;
    }

    const quantity =
      Number(this.adjustmentForm.get('quantity')?.value) || 0;

    const type =
      this.adjustmentForm.get('adjustmentType')?.value;

    if (type === 'remove') {
      return Math.max(this.selectedItem.quantity - quantity, 0);
    }

    return this.selectedItem.quantity + quantity;
  }

  get stockStatusLabel(): string {
    switch (this.selectedItem?.status) {
      case 'in-stock':
        return 'In Stock';
      case 'low-stock':
        return 'Low Stock';
      case 'out-of-stock':
        return 'Out of Stock';
      default:
        return 'Unknown';
    }
  }

  get stockStatusClass(): string {
    switch (this.selectedItem?.status) {
      case 'in-stock':
        return 'status-in-stock';
      case 'low-stock':
        return 'status-low-stock';
      case 'out-of-stock':
        return 'status-out-of-stock';
      default:
        return '';
    }
  }

  // =========================================================
  // SAVE ADJUSTMENT
  // =========================================================

  saveAdjustment(): void {
    if (this.isSaving) {
      return;
    }

    if (this.adjustmentForm.invalid) {
      this.adjustmentForm.markAllAsTouched();
      this.cdr.markForCheck();
      return;
    }

    const productId = Number(
      this.adjustmentForm.get('productId')?.value,
    );

    const quantity = Number(
      this.adjustmentForm.get('quantity')?.value,
    );

    const adjustmentType =
      this.adjustmentForm.get('adjustmentType')?.value;

    if (
      !Number.isInteger(productId) ||
      productId <= 0 ||
      !Number.isFinite(quantity) ||
      quantity < 1
    ) {
      this.adjustmentForm.markAllAsTouched();
      return;
    }

    const signedQuantity =
      adjustmentType === 'remove' ? -quantity : quantity;

    const reference =
      this.adjustmentForm.get('reference')?.value?.trim() ||
      'MANUAL';

    const notes =
      this.adjustmentForm.get('notes')?.value?.trim() ||
      'Manual stock adjustment';

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.cdr.markForCheck();

    this.inventoryService
      .adjustStock(productId, signedQuantity, reference, notes)
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.cdr.markForCheck();
        }),
      )
      .subscribe({
        next: (item) => {
          if (!item) {
            this.errorMessage =
              'Product stock item was not found.';
            this.cdr.markForCheck();
            return;
          }

          this.successMessage =
            `Stock updated successfully. ${item.productName} now has ${item.quantity} units.`;

          this.adjustmentForm.reset({
            productId: '',
            adjustmentType: 'add',
            quantity: 1,
            reference: '',
            notes: '',
          });

          this.selectedItem = null;
          this.cdr.markForCheck();
        },
        error: (error) => {
          console.error('Failed to adjust stock:', error);

          this.errorMessage =
            error?.error?.message ||
            'Unable to adjust stock. Please try again.';

          this.cdr.markForCheck();
        },
      });
  }

  // =========================================================
  // NAVIGATION
  // =========================================================

  cancel(): void {
    void this.router.navigate(['/inventory']);
  }
}
