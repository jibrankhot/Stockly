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
import {
    ActivatedRoute,
    Router,
    RouterLink,
} from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';

import { ButtonComponent } from '../../../shared/components/button/button.component';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
    selector: 'app-reset-password',
    standalone: true,
    imports: [
        ReactiveFormsModule,
        RouterLink,
        InputComponent,
        ButtonComponent,
    ],
    templateUrl: './reset-password.component.html',
    styleUrl: './reset-password.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly router = inject(Router);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    readonly resetPasswordForm = this.formBuilder.nonNullable.group({
        newPassword: [
            '',
            [
                Validators.required,
                Validators.minLength(8),
            ],
        ],
        confirmPassword: [
            '',
            [Validators.required],
        ],
    });

    readonly resetToken =
        this.activatedRoute.snapshot.queryParamMap.get('token');

    isSubmitting = false;
    isResetSuccessful = false;
    tokenMissing = !this.resetToken;

    errorMessage = '';

    onSubmit(): void {
        this.errorMessage = '';

        if (this.tokenMissing) {
            this.errorMessage =
                'This password reset link is invalid or incomplete.';

            this.changeDetectorRef.markForCheck();
            return;
        }

        // After the tokenMissing check, this local variable
        // is correctly narrowed to string.
        const token = this.resetToken;

        if (!token) {
            this.errorMessage =
                'This password reset link is invalid or incomplete.';

            this.changeDetectorRef.markForCheck();
            return;
        }

        if (this.resetPasswordForm.invalid) {
            this.resetPasswordForm.markAllAsTouched();
            this.changeDetectorRef.markForCheck();
            return;
        }

        const {
            newPassword,
            confirmPassword,
        } = this.resetPasswordForm.getRawValue();

        if (newPassword !== confirmPassword) {
            this.errorMessage =
                'Passwords do not match.';

            this.changeDetectorRef.markForCheck();
            return;
        }

        this.isSubmitting = true;

        this.authService
            .resetPassword(
                token,
                newPassword,
            )
            .pipe(
                finalize(() => {
                    this.isSubmitting = false;
                    this.changeDetectorRef.markForCheck();
                }),
            )
            .subscribe({
                next: () => {
                    this.isResetSuccessful = true;
                    this.changeDetectorRef.markForCheck();
                },

                error: () => {
                    this.errorMessage =
                        'This reset link is invalid or has expired. Please request a new password reset link.';

                    this.changeDetectorRef.markForCheck();
                },
            });
    }

    goToForgotPassword(): void {
        void this.router.navigate([
            '/auth/forgot-password',
        ]);
    }
}