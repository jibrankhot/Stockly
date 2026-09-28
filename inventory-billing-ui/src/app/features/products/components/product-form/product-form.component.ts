
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
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
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.scss'
})
export class ProductFormComponent implements OnInit {

  @Input()
  product: Product | null = null;

  @Input()
  isSubmitting = false;

  @Output()
  readonly formSubmit = new EventEmitter<Partial<Product>>();

  @Output()
  readonly cancel = new EventEmitter<void>();

  readonly productForm: FormGroup;

  categories: Category[] = [];

  isLoadingCategories = false;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly categoryService: CategoryService,
    private readonly modalService: ModalService
  ) {
    this.productForm = this.formBuilder.group({
      sku: [
        '',
        [
          Validators.required,
          Validators.maxLength(50)
        ]
      ],

      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(150)
        ]
      ],

      description: [
        '',
        Validators.maxLength(500)
      ],

      categoryId: [
        null,
        Validators.required
      ],

      unit: [
        'pcs',
        [
          Validators.required,
          Validators.maxLength(20)
        ]
      ],

      purchasePrice: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      sellingPrice: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
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
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      minimumStock: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],

      isActive: [
        true
      ]
    });
  }

  ngOnInit(): void {
    this.loadCategories();

    if (this.product) {
      this.productForm.patchValue({
        sku: this.product.sku,
        name: this.product.name,
        description: this.product.description,
        categoryId: this.product.categoryId,
        unit: this.product.unit,
        purchasePrice: this.product.purchasePrice,
        sellingPrice: this.product.sellingPrice,
        taxRate: this.product.taxRate,
        currentStock: this.product.currentStock,
        minimumStock: this.product.minimumStock,
        isActive: this.product.isActive
      });
    }
  }

  loadCategories(): void {
    this.isLoadingCategories = true;

    this.categoryService.getCategories().subscribe({
      next: categories => {
        this.categories = categories.filter(
          category => category.isActive
        );

        this.isLoadingCategories = false;
      },

      error: error => {
        console.error(
          'Failed to load categories:',
          error
        );

        this.isLoadingCategories = false;
      }
    });
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();

      this.focusFirstInvalidField();

      return;
    }

    this.formSubmit.emit(
      this.productForm.getRawValue()
    );
  }

  private focusFirstInvalidField(): void {
    const firstInvalidControl =
      Object.keys(this.productForm.controls).find(
        fieldName =>
          this.productForm.get(fieldName)?.invalid
      );

    if (!firstInvalidControl) {
      return;
    }

    const element = document.getElementById(
      firstInvalidControl
    );

    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    });

    setTimeout(() => {
      element.focus();
    }, 300);
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