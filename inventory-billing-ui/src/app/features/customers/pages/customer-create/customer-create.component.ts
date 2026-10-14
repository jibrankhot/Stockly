
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CustomerService } from '../../services/customer.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-customer-create',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink
    ],
    templateUrl: './customer-create.component.html',
    styleUrl: './customer-create.component.scss'
})
export class CustomerCreateComponent {
    private readonly fb = inject(FormBuilder);
    private readonly customerService = inject(CustomerService);
    private readonly notificationService = inject(NotificationService);
    private readonly router = inject(Router);

    readonly customerForm = this.fb.nonNullable.group({
        code: [
            '',
            [
                Validators.required,
                Validators.maxLength(20)
            ]
        ],
        name: [
            '',
            [
                Validators.required,
                Validators.maxLength(100)
            ]
        ],
        email: [
            '',
            [
                Validators.email,
                Validators.maxLength(100)
            ]
        ],
        phone: ['', [Validators.maxLength(20)]],
        address: ['', [Validators.maxLength(200)]],
        city: ['', [Validators.maxLength(50)]],
        state: ['', [Validators.maxLength(50)]],
        postalCode: ['', [Validators.maxLength(10)]],
        taxNumber: ['', [Validators.maxLength(30)]],
        isActive: [true]
    });

    isSaving = false;
    submitted = false;
    errorMessage = '';

    get codeControl() {
        return this.customerForm.controls.code;
    }

    get nameControl() {
        return this.customerForm.controls.name;
    }

    get emailControl() {
        return this.customerForm.controls.email;
    }

    showError(
        controlName: keyof typeof this.customerForm.controls
    ): boolean {
        const control = this.customerForm.controls[controlName];

        return control.invalid &&
            (control.touched || this.submitted);
    }

    saveCustomer(): void {
        if (this.isSaving) {
            return;
        }

        this.submitted = true;

        if (this.customerForm.invalid) {
            this.customerForm.markAllAsTouched();
            return;
        }

        this.isSaving = true;
        this.errorMessage = '';

        this.customerService
            .createCustomer(this.customerForm.getRawValue())
            .pipe(
                finalize(() => {
                    this.isSaving = false;
                })
            )
            .subscribe({
                next: customer => {
                    this.notificationService.success(
                        'Customer created successfully.'
                    );

                    void this.router.navigate([
                        '/customers',
                        customer.id
                    ]);
                },
                error: () => {
                    this.errorMessage =
                        'Unable to create customer. Please check the details and try again.';

                    this.notificationService.error(
                        this.errorMessage
                    );
                }
            });
    }

    cancel(): void {
        if (this.isSaving) {
            return;
        }

        void this.router.navigate(['/customers']);
    }
}