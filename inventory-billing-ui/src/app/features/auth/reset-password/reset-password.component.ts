
import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/services/auth.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [ReactiveFormsModule, RouterLink, ButtonComponent],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
    private readonly fb = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly cdr = inject(ChangeDetectorRef);

    token = this.route.snapshot.queryParamMap.get('token') ?? '';
    isSubmitting = false;
    isSubmitted = false;
    errorMessage = '';

    readonly resetPasswordForm = this.fb.nonNullable.group({
        newPassword: [
            '',
            [
                Validators.required,
                Validators.minLength(8),
                Validators.maxLength(72),
            ],
        ],
        confirmPassword: ['', Validators.required],
    });

    onSubmit(): void {
        this.errorMessage = '';

        if (!/^[a-f\d]{64}$/i.test(this.token)) {
            this.errorMessage =
                'This reset link is invalid or expired. Please request a new one.';
            return;
        }

        if (this.resetPasswordForm.invalid) {
            this.resetPasswordForm.markAllAsTouched();
            return;
        }

        const { newPassword, confirmPassword } =
            this.resetPasswordForm.getRawValue();

        if (newPassword !== confirmPassword) {
            this.errorMessage = 'The passwords do not match.';
            return;
        }

        if (new TextEncoder().encode(newPassword).length > 72) {
            this.errorMessage =
                'Your password must not exceed 72 UTF-8 bytes.';
            return;
        }

        this.isSubmitting = true;

        this.authService
            .resetPassword(this.token, newPassword)
            .pipe(
                finalize(() => {
                    this.isSubmitting = false;
                    this.cdr.markForCheck();
                }),
            )
            .subscribe({
                next: (response) => {
                    if (!response.success) {
                        this.errorMessage =
                            response.message || 'Unable to reset your password.';
                        this.cdr.markForCheck();
                        return;
                    }

                    this.isSubmitted = true;
                    this.token = '';
                    this.resetPasswordForm.reset();

                    void this.router.navigate([], {
                        relativeTo: this.route,
                        queryParams: { token: null },
                        replaceUrl: true,
                    });

                    this.cdr.markForCheck();
                },
                error: (error) => {
                    this.errorMessage =
                        error?.error?.message ||
                        'This reset link is invalid, expired, or already used. Please request a new one.';
                    this.cdr.markForCheck();
                },
            });
    }
}
