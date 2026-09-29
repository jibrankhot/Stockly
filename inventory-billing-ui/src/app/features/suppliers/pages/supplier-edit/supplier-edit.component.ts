
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Supplier } from '../../../../shared/models/supplier';
import { SupplierService } from '../../services/supplier.service';
import { SupplierFormComponent } from '../../components/supplier-form/supplier-form.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-supplier-edit',
    standalone: true,
    imports: [
        SupplierFormComponent
    ],
    templateUrl: './supplier-edit.component.html',
    styleUrl: './supplier-edit.component.scss'
})
export class SupplierEditComponent implements OnInit {

    supplier: Supplier | null = null;

    isLoading = false;

    isSubmitting = false;

    constructor(
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly supplierService: SupplierService,
        private readonly notificationService: NotificationService
    ) { }

    ngOnInit(): void {
        this.loadSupplier();
    }

    loadSupplier(): void {
        const id = Number(
            this.route.snapshot.paramMap.get('id')
        );

        if (!id) {
            this.router.navigate(['/suppliers']);
            return;
        }

        this.isLoading = true;

        this.supplierService
            .getSupplierById(id)
            .subscribe({
                next: supplier => {
                    this.supplier = supplier;
                    this.isLoading = false;

                    if (!supplier) {
                        this.router.navigate(['/suppliers']);
                    }
                },

                error: error => {
                    console.error(
                        'Failed to load supplier:',
                        error
                    );

                    this.isLoading = false;

                    this.notificationService.error(
                        error?.error?.message ||
                        'Failed to load supplier. Please try again.'
                    );

                    this.router.navigate(['/suppliers']);
                }
            });
    }

    onSubmit(supplierData: Partial<Supplier>): void {
        if (!this.supplier) {
            return;
        }

        this.isSubmitting = true;

        this.supplierService
            .updateSupplier(
                this.supplier.id,
                supplierData
            )
            .subscribe({
                next: updatedSupplier => {
                    this.isSubmitting = false;

                    if (!updatedSupplier) {
                        this.notificationService.error(
                            'Supplier could not be updated.'
                        );

                        return;
                    }

                    this.notificationService.success(
                        'Supplier updated successfully.'
                    );

                    this.router.navigate([
                        '/suppliers'
                    ]);
                },

                error: error => {
                    console.error(
                        'Failed to update supplier:',
                        error
                    );

                    this.isSubmitting = false;

                    this.notificationService.error(
                        error?.error?.message ||
                        'Failed to update supplier. Please try again.'
                    );
                }
            });
    }

    onCancel(): void {
        if (this.supplier) {
            this.router.navigate([
                '/suppliers'
            ]);

            return;
        }

        this.router.navigate(['/suppliers']);
    }
}