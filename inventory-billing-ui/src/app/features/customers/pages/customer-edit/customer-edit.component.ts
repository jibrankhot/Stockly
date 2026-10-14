
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { CustomerService } from '../../services/customer.service';
import { Customer } from '../../../../shared/models/customer';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-customer-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterLink
    ],
    templateUrl: './customer-edit.component.html',
    styleUrl: './customer-edit.component.scss'
})
export class CustomerEditComponent implements OnInit {
    readonly customerForm;

    customer: Customer | null = null;
    customerId = 0;

    isLoading = true;
    isSaving = false;
    submitted = false;
    errorMessage = '';

    constructor(
        private readonly fb: FormBuilder,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly customerService: CustomerService,
        private readonly notificationService: NotificationService,
        private readonly cdr: ChangeDetectorRef
    ) {
        this.customerForm = this.fb.nonNullable.group({
            code: [
                '',
                [Validators.required, Validators.maxLength(20)]
            ],
            name: [
                '',
                [Validators.required, Validators.maxLength(100)]
            ],
            taxNumber: [
                '',
                [Validators.maxLength(30)]
            ],
            isActive: [true],
            email: [
                '',
                [Validators.email, Validators.maxLength(100)]
            ],
            phone: [
                '',
                [Validators.maxLength(20)]
            ],
            address: [
                '',
                [Validators.maxLength(200)]
            ],
            city: [
                '',
                [Validators.maxLength(50)]
            ],
            state: [
                '',
                [Validators.maxLength(50)]
            ],
            postalCode: [
                '',
                [Validators.maxLength(10)]
            ]
        });
    }

    ngOnInit(): void {
        const id = Number(this.route.snapshot.paramMap.get('id'));

        if (!Number.isSafeInteger(id) || id <= 0) {
            this.errorMessage = 'Invalid customer ID.';
            this.isLoading = false;
            this.cdr.markForCheck();
            return;
        }

        this.customerId = id;
        this.loadCustomer();
    }

    get codeControl() {
        return this.customerForm.controls.code;
    }

    get nameControl() {
        return this.customerForm.controls.name;
    }

    get emailControl() {
        return this.customerForm.controls.email;
    }

    get isActiveControl() {
        return this.customerForm.controls.isActive;
    }

    showError(
        controlName: keyof typeof this.customerForm.controls
    ): boolean {
        const control = this.customerForm.controls[controlName];

        return control.invalid &&
            (control.touched || this.submitted);
    }

    loadCustomer(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.customerService
            .getCustomerById(this.customerId)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    this.cdr.markForCheck();
                })
            )
            .subscribe({
                next: (customer) => {
                    if (!customer) {
                        this.customer = null;
                        this.errorMessage = 'Customer not found.';
                        return;
                    }

                    this.customer = customer;

                    this.customerForm.patchValue({
                        code: customer.code ?? '',
                        name: customer.name ?? '',
                        taxNumber: customer.taxNumber ?? '',
                        isActive: customer.isActive ?? true,
                        email: customer.email ?? '',
                        phone: customer.phone ?? '',
                        address: customer.address ?? '',
                        city: customer.city ?? '',
                        state: customer.state ?? '',
                        postalCode: customer.postalCode ?? ''
                    });
                },
                error: () => {
                    this.customer = null;
                    this.errorMessage = 'Unable to load customer.';

                    this.notificationService.error(
                        this.errorMessage
                    );
                }
            });
    }

    saveCustomer(): void {
        if (
            this.isSaving ||
            this.isLoading ||
            !this.customer
        ) {
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
            .updateCustomer(
                this.customerId,
                this.customerForm.getRawValue()
            )
            .pipe(
                finalize(() => {
                    this.isSaving = false;
                    this.cdr.markForCheck();
                })
            )
            .subscribe({
                next: () => {
                    this.notificationService.success(
                        'Customer updated successfully.'
                    );

                    this.router.navigate(['/customers']);
                },
                error: () => {
                    this.errorMessage =
                        'Unable to update customer. Please try again.';

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

        this.router.navigate([
            '/customers',
            this.customerId
        ]);
    }
}
