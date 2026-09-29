
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
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

    customerForm: FormGroup;

    isSaving = false;
    errorMessage = '';

    constructor(
        private readonly fb: FormBuilder,
        private readonly customerService: CustomerService,
        private readonly notificationService: NotificationService,
        private readonly router: Router
    ) {
        this.customerForm = this.fb.group({
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

            phone: [
                '',
                [
                    Validators.maxLength(20)
                ]
            ],

            address: [
                '',
                [
                    Validators.maxLength(200)
                ]
            ],

            city: [
                '',
                [
                    Validators.maxLength(50)
                ]
            ],

            state: [
                '',
                [
                    Validators.maxLength(50)
                ]
            ],

            postalCode: [
                '',
                [
                    Validators.maxLength(10)
                ]
            ],

            taxNumber: [
                '',
                [
                    Validators.maxLength(30)
                ]
            ],

            isActive: [true]
        });
    }

    saveCustomer(): void {
        if (this.isSaving) {
            return;
        }

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

                    this.router.navigate([
                        '/customers',
                        customer.id
                    ]);
                },

                error: () => {
                    this.errorMessage =
                        'Unable to create customer.';

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

        this.router.navigate(['/customers']);
    }
}