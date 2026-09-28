
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';

import { Category } from '../../../shared/models/category';

@Component({
  selector: 'app-category-form',
  standalone: true,
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './category-form.component.html',
  styleUrl: './category-form.component.scss'
})
export class CategoryFormComponent implements OnChanges {

  @Input()
  category: Category | null = null;

  @Input()
  isSubmitting = false;

  @Output()
  readonly formSubmit = new EventEmitter<Partial<Category>>();

  @Output()
  readonly cancel = new EventEmitter<void>();

  readonly categoryForm: FormGroup;

  constructor(
    private readonly formBuilder: FormBuilder
  ) {
    this.categoryForm = this.formBuilder.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(100)
        ]
      ],

      description: [
        '',
        Validators.maxLength(500)
      ],

      isActive: [
        true
      ]
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['category'] && this.category) {
      this.categoryForm.patchValue({
        name: this.category.name,
        description: this.category.description,
        isActive: this.category.isActive
      });
    }
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      this.focusFirstInvalidField();
      return;
    }

    this.formSubmit.emit(
      this.categoryForm.getRawValue()
    );
  }

  onCancel(): void {
    if (this.isSubmitting) {
      return;
    }

    this.cancel.emit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.categoryForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );
  }

  private focusFirstInvalidField(): void {
    const firstInvalidControl =
      Object.keys(this.categoryForm.controls).find(
        fieldName =>
          this.categoryForm.get(fieldName)?.invalid
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
}