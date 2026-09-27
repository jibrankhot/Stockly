
import { Component, OnInit } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
    PurchaseOrder,
    PurchaseOrderStatus
} from '../../../../shared/models/purchase-order';

import { PurchaseOrderService } from '../../services/purchase-order.service';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
    selector: 'app-purchase-order-list',
    standalone: true,
    imports: [
        DatePipe,
        DecimalPipe,
        FormsModule,
        RouterLink
    ],
    templateUrl: './purchase-order-list.component.html',
    styleUrl: './purchase-order-list.component.scss'
})
export class PurchaseOrderListComponent implements OnInit {

    purchaseOrders: PurchaseOrder[] = [];

    searchTerm = '';

    selectedStatus: PurchaseOrderStatus | 'all' = 'all';

    isLoading = false;

    constructor(
        private readonly purchaseOrderService: PurchaseOrderService,
        private readonly router: Router,
        private readonly modalService: ModalService
    ) { }

    ngOnInit(): void {
        this.loadPurchaseOrders();
    }

    get filteredPurchaseOrders(): PurchaseOrder[] {
        const search = this.searchTerm
            .trim()
            .toLowerCase();

        return this.purchaseOrders.filter(order => {

            const matchesSearch =
                !search ||
                order.orderNumber.toLowerCase().includes(search) ||
                order.supplierName.toLowerCase().includes(search);

            const matchesStatus =
                this.selectedStatus === 'all' ||
                order.status === this.selectedStatus;

            return (
                matchesSearch &&
                matchesStatus
            );
        });
    }

    loadPurchaseOrders(): void {
        this.isLoading = true;

        this.purchaseOrderService
            .getPurchaseOrders()
            .subscribe({
                next: orders => {
                    this.purchaseOrders = orders;
                    this.isLoading = false;
                },

                error: error => {
                    console.error(
                        'Failed to load purchase orders:',
                        error
                    );

                    this.isLoading = false;
                }
            });
    }

    viewPurchaseOrder(order: PurchaseOrder): void {
        this.router.navigate([
            '/purchases',
            order.id
        ]);
    }

    editPurchaseOrder(order: PurchaseOrder): void {
        this.router.navigate([
            '/purchases',
            order.id,
            'edit'
        ]);
    }

    deletePurchaseOrder(order: PurchaseOrder): void {
        this.modalService
            .open(
                'Delete Purchase Order?',
                `Are you sure you want to delete "${order.orderNumber}"? This action cannot be undone.`,
                'Delete Purchase Order',
                'Cancel',
                'danger'
            )
            .subscribe(confirmed => {
                if (!confirmed) {
                    return;
                }

                this.purchaseOrderService
                    .deletePurchaseOrder(order.id)
                    .subscribe({
                        next: deleted => {
                            if (!deleted) {
                                console.error(
                                    'Purchase order could not be deleted.'
                                );

                                return;
                            }

                            this.purchaseOrders =
                                this.purchaseOrders.filter(
                                    item => item.id !== order.id
                                );
                        },

                        error: error => {
                            console.error(
                                'Failed to delete purchase order:',
                                error
                            );
                        }
                    });
            });
    }

    getStatusLabel(
        status: PurchaseOrderStatus
    ): string {

        switch (status) {
            case 'draft':
                return 'Draft';

            case 'ordered':
                return 'Ordered';

            case 'partially-received':
                return 'Partially Received';

            case 'received':
                return 'Received';

            case 'cancelled':
                return 'Cancelled';

            default:
                return status;
        }
    }

    clearFilters(): void {
        this.searchTerm = '';
        this.selectedStatus = 'all';
    }
}