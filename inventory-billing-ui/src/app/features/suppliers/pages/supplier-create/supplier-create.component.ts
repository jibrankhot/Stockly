
import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Supplier } from '../../../../shared/models/supplier';
import { SupplierService } from '../../services/supplier.service';
import { SupplierFormComponent } from '../../components/supplier-form/supplier-form.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-supplier-create',
    standalone: true,
    imports: [
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

    onSubmit(supplierData: Partial<Supplier>): void {
        this.isSubmitting = true;

        this.supplierService
            .createSupplier(supplierData)
            .subscribe({
                next: supplier => {
                    this.isSubmitting = false;

                    this.notificationService.success(
                        'Supplier created successfully.'
                    );

                    this.router.navigate(['/suppliers']);
                },

                error: error => {
                    console.error(
                        'Failed to create supplier:',
                        error
                    );

                    this.isSubmitting = false;

                    this.notificationService.error(
                        error?.error?.message ||
                        'Failed to create supplier. Please try again.'
                    );
                }
            });
    }

    onCancel(): void {
        this.router.navigate(['/suppliers']);
    }
}