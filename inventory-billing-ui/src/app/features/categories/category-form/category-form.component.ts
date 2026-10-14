import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import {
  Category,
  CategoryInput,
} from '../../../shared/models/category';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormComponent implements OnChanges {
  private readonly formBuilder = inject(FormBuilder);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  @Input() category: Category | null = null;
  @Input() isSubmitting = false;

  @Output() readonly formSubmit = new EventEmitter<CategoryInput>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly categoryForm = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(500)]],
    isActive: [true],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['category']) {
      return;
    }

    if (this.category) {
      this.categoryForm.reset({
        name: this.category.name ?? '',
        description: this.category.description ?? '',
        isActive: this.category.isActive,
      });
      return;
    }

    this.categoryForm.reset({
      name: '',
      description: '',
      isActive: true,
    });
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    const nameControl = this.categoryForm.controls.name;
    nameControl.setValue(nameControl.value.trim());
    this.categoryForm.updateValueAndValidity();

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    this.formSubmit.emit(this.categoryForm.getRawValue());
  }

  onCancel(): void {
    if (!this.isSubmitting) {
      this.cancel.emit();
    }
  }

  isFieldInvalid(fieldName: 'name' | 'description'): boolean {
    const field = this.categoryForm.controls[fieldName];
    return field.invalid && (field.dirty || field.touched);
  }

  private focusFirstInvalidField(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const firstInvalidControl = Object.keys(this.categoryForm.controls).find(
      (fieldName) =>
        this.categoryForm.get(fieldName)?.invalid,
    );

    if (!firstInvalidControl) {
      return;
    }

    const element = this.document.getElementById(firstInvalidControl);

    if (!(element instanceof HTMLElement)) {
      return;
    }

    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
    element.focus();
  }
}