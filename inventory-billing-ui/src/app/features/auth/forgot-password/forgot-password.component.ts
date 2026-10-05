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

  onSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;

    const email = this.forgotPasswordForm.controls.email.value;

    this.authService
      .requestPasswordReset(email)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: () => {
          this.isSubmitted = true;
          this.changeDetectorRef.markForCheck();
        },

        error: () => {
          this.changeDetectorRef.markForCheck();
        },
      });
  }
}