import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  readonly forgotPasswordForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  isSubmitting = false;
  isSubmitted = false;
  errorMessage = '';

  onSubmit(): void {
    if (this.isSubmitting || this.isSubmitted) {
      return;
    }

    const emailControl = this.forgotPasswordForm.controls.email;
    const email = emailControl.value.trim();

    emailControl.setValue(email);
    emailControl.updateValueAndValidity();

    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.errorMessage = '';
    this.isSubmitting = true;

    this.authService
      .requestPasswordReset(email)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: (response) => {
          if (!response.success) {
            this.errorMessage =
              response.message ||
              'Unable to process your request. Please try again.';
            this.changeDetectorRef.markForCheck();
            return;
          }

          this.isSubmitted = true;
          this.changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message ||
            'We could not process your request right now. Please try again later.';

          this.changeDetectorRef.markForCheck();
        },
      });
  }
}