
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Product } from '../../../../shared/models/product';
import { Category } from '../../../../shared/models/category';
import { CategoryService } from '../../../categories/services/category.service';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit, OnChanges {
  @Input() product: Product | null = null;
  @Input() isSubmitting = false;

  @Output() readonly formSubmit = new EventEmitter<Partial<Product>>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly productForm: FormGroup;

  categories: Category[] = [];
  isLoadingCategories = false;
  hasCategoryLoadError = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly categoryService: CategoryService,
    private readonly modalService: ModalService
  ) {
    this.productForm = this.formBuilder.group({
      sku: [
        '',
        [Validators.required, Validators.maxLength(100)]
      ],
      name: [
        '',
        [Validators.required, Validators.maxLength(200)]
      ],
      description: ['', Validators.maxLength(500)],
      categoryId: [
        { value: null, disabled: true },
        Validators.required
      ],
      unit: [
        'pcs',
        [Validators.required, Validators.maxLength(50)]
      ],
      purchasePrice: [
        0,
        [Validators.required, Validators.min(0)]
      ],
      sellingPrice: [
        0,
        [Validators.required, Validators.min(0)]
      ],
      taxRate: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ]
      ],
      currentStock: [
        0,
        [Validators.required, Validators.min(0)]
      ],
      minimumStock: [
        0,
        [Validators.required, Validators.min(0)]
      ],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['product']) {
      if (this.product) {
        this.populateForm();
      } else if (!changes['product'].firstChange) {
        this.productForm.reset({
          sku: '',
          name: '',
          description: '',
          categoryId: null,
          unit: 'pcs',
          purchasePrice: 0,
          sellingPrice: 0,
          taxRate: 0,
          currentStock: 0,
          minimumStock: 0,
          isActive: true
        });
      }
    }
  }

  private populateForm(): void {
    if (!this.product) {
      return;
    }

    this.productForm.patchValue({
      sku: this.product.sku,
      name: this.product.name,
      description: this.product.description ?? '',
      categoryId: this.product.categoryId,
      unit: this.product.unit,
      purchasePrice: this.product.purchasePrice,
      sellingPrice: this.product.sellingPrice,
      taxRate: this.product.taxRate,
      currentStock: this.product.currentStock,
      minimumStock: this.product.minimumStock,
      isActive: this.product.isActive
    });

    this.productForm.markAsPristine();
    this.productForm.markAsUntouched();
  }

  loadCategories(): void {
    if (this.isLoadingCategories) {
      return;
    }

    this.isLoadingCategories = true;
    this.hasCategoryLoadError = false;
    this.productForm.get('categoryId')?.disable();

    this.categoryService.getCategories().subscribe({
      next: (categories: Category[]) => {
        const currentCategoryId = this.product?.categoryId;

        this.categories = categories.filter(category =>
          category.isActive || category.id === currentCategoryId
        );

        this.isLoadingCategories = false;
        this.hasCategoryLoadError = false;
        this.productForm.get('categoryId')?.enable();

        if (this.product) {
          this.productForm.patchValue({
            categoryId: this.product.categoryId
          });
        }
      },
      error: error => {
        console.error('Failed to load categories:', error);

        this.categories = [];
        this.isLoadingCategories = false;
        this.hasCategoryLoadError = true;
        this.productForm.get('categoryId')?.disable();
      }
    });
  }

  submit(): void {
    if (
      this.isSubmitting ||
      this.isLoadingCategories ||
      this.hasCategoryLoadError
    ) {
      return;
    }

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    this.formSubmit.emit(
      this.productForm.getRawValue() as Partial<Product>
    );
  }

  private focusFirstInvalidField(): void {
    const firstInvalidControl = Object.keys(this.productForm.controls).find(
      fieldName => this.productForm.get(fieldName)?.invalid
    );

    if (!firstInvalidControl) {
      return;
    }

    const element = document.getElementById(firstInvalidControl);

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    element.focus({ preventScroll: true });
  }

  onCancel(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.productForm.pristine) {
      this.cancel.emit();
      return;
    }

    this.modalService.open(
      'Discard Changes?',
      'You have unsaved changes. Are you sure you want to leave without saving?',
      'Discard',
      'Keep Editing',
      'danger'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.cancel.emit();
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );
  }
}
