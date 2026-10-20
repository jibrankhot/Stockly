
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Supplier } from '../../../../shared/models/supplier';
import {
    CreateSupplierRequest,
    SupplierService
} from '../../services/supplier.service';
import { SupplierFormComponent } from '../../components/supplier-form/supplier-form.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-supplier-create',
    standalone: true,
    imports: [
        RouterLink,
        SupplierFormComponent
    ],
    templateUrl: './supplier-create.component.html',
    styleUrl: './supplier-create.component.scss'
})
export class SupplierCreateComponent {
    isSubmitting = false;

    constructor(
        private readonly supplierService: SupplierService,
        private readonly notificationService: NotificationService,
        private readonly router: Router
    ) { }

    onSubmit(supplierData: CreateSupplierRequest): void {
        if (this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;

        this.supplierService
            .createSupplier(supplierData)
            .pipe(
                finalize(() => {
                    this.isSubmitting = false;
                })
            )
            .subscribe({
                next: (_supplier: Supplier) => {
                    this.notificationService.success(
                        'Supplier created successfully.'
                    );

                    void this.router.navigate(['/suppliers']);
                },

                error: (error: unknown) => {
                    console.error('Failed to create supplier:', error);

                    this.notificationService.error(
                        this.getErrorMessage(error)
                    );
                }
            });
    }

    onCancel(): void {
        if (this.isSubmitting) {
            return;
        }

        void this.router.navigate(['/suppliers']);
    }

    private getErrorMessage(error: unknown): string {
        if (
            typeof error === 'object' &&
            error !== null &&
            'error' in error
        ) {
            const response = error.error;

            if (
                typeof response === 'object' &&
                response !== null &&
                'message' in response &&
                typeof response.message === 'string' &&
                response.message.trim().length > 0
            ) {
                return response.message;
            }
        }

        return 'Failed to create supplier. Please try again.';
    }
}
