
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject
} from '@angular/core';

import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';

import { Supplier } from '../../../../shared/models/supplier';
import { CreateSupplierRequest } from '../../services/supplier.service';

const trimmedRequired: ValidatorFn = (
  control: AbstractControl
): ValidationErrors | null => {
  return typeof control.value === 'string' &&
    control.value.trim().length > 0
    ? null
    : { required: true };
};

@Component({
  selector: 'app-supplier-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './supplier-form.component.html',
  styleUrl: './supplier-form.component.scss'
})
export class SupplierFormComponent implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);

  @Input() supplier: Supplier | null = null;
  @Input() isSubmitting = false;

  @Output()
  readonly formSubmit = new EventEmitter<CreateSupplierRequest>();

  @Output()
  readonly cancel = new EventEmitter<void>();

  readonly supplierForm = this.formBuilder.nonNullable.group({
    code: [
      '',
      [trimmedRequired, Validators.maxLength(100)]
    ],
    name: [
      '',
      [trimmedRequired, Validators.maxLength(200)]
    ],
    email: [
      '',
      [Validators.email, Validators.maxLength(255)]
    ],
    phone: ['', [Validators.maxLength(30)]],
    address: [''],
    city: ['', [Validators.maxLength(100)]],
    state: ['', [Validators.maxLength(100)]],
    postalCode: ['', [Validators.maxLength(20)]],
    taxNumber: ['', [Validators.maxLength(100)]],
    isActive: [true]
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['supplier']) {
      this.supplierForm.reset({
        code: this.supplier?.code ?? '',
        name: this.supplier?.name ?? '',
        email: this.supplier?.email ?? '',
        phone: this.supplier?.phone ?? '',
        address: this.supplier?.address ?? '',
        city: this.supplier?.city ?? '',
        state: this.supplier?.state ?? '',
        postalCode: this.supplier?.postalCode ?? '',
        taxNumber: this.supplier?.taxNumber ?? '',
        isActive: this.supplier?.isActive ?? true
      });
    }
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.supplierForm.invalid) {
      this.supplierForm.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    const value = this.supplierForm.getRawValue();

    this.formSubmit.emit({
      code: value.code.trim(),
      name: value.name.trim(),
      email: value.email.trim() || null,
      phone: value.phone.trim() || null,
      address: value.address.trim() || null,
      city: value.city.trim() || null,
      state: value.state.trim() || null,
      postalCode: value.postalCode.trim() || null,
      taxNumber: value.taxNumber.trim() || null,
      isActive: value.isActive
    });
  }

  onCancel(): void {
    if (!this.isSubmitting) {
      this.cancel.emit();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.supplierForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );
  }

  private focusFirstInvalidField(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const firstInvalidControl = Object.keys(
      this.supplierForm.controls
    ).find(fieldName =>
      this.supplierForm.get(fieldName)?.invalid
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

    element.focus();
  }
}
