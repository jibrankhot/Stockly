import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly route = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);

    token = '';
    isSubmitting = false;
    isSubmitted = false;
    errorMessage = '';

    readonly resetPasswordForm = this.formBuilder.nonNullable.group({
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

    constructor() {
        this.route.queryParamMap
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((params) => {
                this.token = params.get('token') ?? '';
                this.errorMessage = '';
                this.changeDetectorRef.markForCheck();
            });
    }

    get passwordsDoNotMatch(): boolean {
        const controls = this.resetPasswordForm.controls;

        return (
            controls.confirmPassword.touched &&
            controls.confirmPassword.value !== controls.newPassword.value
        );
    }

    onSubmit(): void {
        if (this.isSubmitting || this.isSubmitted) {
            return;
        }

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
                    this.changeDetectorRef.markForCheck();
                }),
            )
            .subscribe({
                next: (response) => {
                    if (!response.success) {
                        this.errorMessage =
                            response.message || 'Unable to reset your password.';
                        this.changeDetectorRef.markForCheck();
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

                    this.changeDetectorRef.markForCheck();
                },
                error: (error) => {
                    this.errorMessage =
                        error?.error?.message ||
                        'This reset link is invalid, expired, or already used. Please request a new one.';
                    this.changeDetectorRef.markForCheck();
                },
            });
    }
}