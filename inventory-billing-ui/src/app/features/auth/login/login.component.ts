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
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../core/auth/services/auth.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [ReactiveFormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
    private readonly formBuilder = inject(FormBuilder);
    private readonly authService = inject(AuthService);
    private readonly router = inject(Router);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);

    isSubmitting = false;
    errorMessage = '';

    readonly loginForm = this.formBuilder.nonNullable.group({
        username: ['', [Validators.required]],
        password: ['', [Validators.required]],
    });

    onSubmit(): void {
        this.errorMessage = '';

        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;

        const { username, password } =
            this.loginForm.getRawValue();

        this.authService
            .login({
                username,
                password,
            })
            .pipe(
                finalize(() => {
                    this.isSubmitting = false;
                    this.changeDetectorRef.markForCheck();
                }),
            )
            .subscribe({
                next: () => {
                    void this.router.navigate(['/dashboard']);
                },

                error: () => {
                    this.errorMessage =
                        'Invalid username or password.';

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