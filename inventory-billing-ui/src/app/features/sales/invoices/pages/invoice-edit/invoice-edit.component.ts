
import { CommonModule, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
    FormArray,
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { Customer } from '../../../../../shared/models/customer';
import { Invoice } from '../../../../../shared/models/invoice';
import { InvoiceItem } from '../../../../../shared/models/invoice-item';
import { Product } from '../../../../../shared/models/product';

import { InvoiceService } from '../../services/invoice.service';
import { CustomerService } from '../../../../customers/services/customer.service';
import { ProductService } from '../../../../products/services/product.service';

@Component({
    selector: 'app-invoice-edit',
    standalone: true,
    imports: [
        CommonModule,
        DecimalPipe,
        ReactiveFormsModule,
        RouterLink
    ],
    templateUrl: './invoice-edit.component.html',
    styleUrl: './invoice-edit.component.scss'
})
export class InvoiceEditComponent implements OnInit {
    invoiceForm: FormGroup;

    invoice: Invoice | null = null;
    customers: Customer[] = [];
    products: Product[] = [];

    isLoading = true;
    isSaving = false;
    errorMessage = '';

    invoiceId = 0;

    subtotal = 0;
    taxAmount = 0;
    discountAmount = 0;
    totalAmount = 0;

    constructor(
        private fb: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private invoiceService: InvoiceService,
        private customerService: CustomerService,
        private productService: ProductService
    ) {
        this.invoiceForm = this.fb.group({
            customerId: ['', Validators.required],
            invoiceDate: ['', Validators.required],
            dueDate: [''],
            status: ['draft', Validators.required],
            notes: [''],
            items: this.fb.array([])
        });
    }

    ngOnInit(): void {
        this.invoiceId = Number(this.route.snapshot.paramMap.get('id'));

        if (!this.invoiceId) {
            this.errorMessage = 'Invalid invoice ID.';
            this.isLoading = false;
            return;
        }

        this.loadCustomers();
        this.loadProducts();
        this.loadInvoice();
    }

    get items(): FormArray {
        return this.invoiceForm.get('items') as FormArray;
    }

    loadCustomers(): void {
        this.customerService.getCustomers().subscribe({
            next: (customers) => {
                this.customers = (customers ?? []).filter(
                    customer => customer.isActive
                );
            },
            error: () => {
                this.errorMessage = 'Unable to load customers.';
            }
        });
    }

    loadProducts(): void {
        this.productService.getProducts().subscribe({
            next: (products) => {
                this.products = (products ?? []).filter(
                    product => product.isActive
                );
            },
            error: () => {
                this.errorMessage = 'Unable to load products.';
            }
        });
    }

    loadInvoice(): void {
        this.isLoading = true;
        this.errorMessage = '';

        this.invoiceService.getInvoiceById(this.invoiceId).subscribe({
            next: (invoice) => {
                if (!invoice) {
                    this.errorMessage = 'Invoice not found.';
                    this.isLoading = false;
                    return;
                }

                this.invoice = invoice;

                this.invoiceForm.patchValue({
                    customerId: invoice.customerId,
                    invoiceDate: this.toDateInputValue(invoice.invoiceDate),
                    dueDate: invoice.dueDate
                        ? this.toDateInputValue(invoice.dueDate)
                        : '',
                    status: invoice.status,
                    notes: invoice.notes ?? ''
                });

                this.loadInvoiceItems();
            },
            error: () => {
                this.errorMessage = 'Unable to load invoice.';
                this.isLoading = false;
            }
        });
    }

    loadInvoiceItems(): void {
        this.invoiceService.getInvoiceItems(this.invoiceId).subscribe({
            next: (items) => {
                this.items.clear();

                (items ?? []).forEach(item => {
                    this.items.push(this.createItemForm(item));
                });

                this.calculateTotals();
                this.isLoading = false;
            },
            error: () => {
                this.errorMessage = 'Unable to load invoice items.';
                this.isLoading = false;
            }
        });
    }

    createItemForm(item?: InvoiceItem): FormGroup {
        return this.fb.group({
            id: [item?.id ?? 0],
            productId: [
                item?.productId ?? '',
                Validators.required
            ],
            productName: [item?.productName ?? ''],
            sku: [item?.sku ?? ''],
            quantity: [
                item?.quantity ?? 1,
                [Validators.required, Validators.min(1)]
            ],
            unitPrice: [
                item?.unitPrice ?? 0,
                [Validators.required, Validators.min(0)]
            ],
            taxRate: [
                item?.taxRate ?? 0,
                [Validators.required, Validators.min(0)]
            ],
            discountAmount: [
                item?.discountAmount ?? 0,
                [Validators.min(0)]
            ],
            taxAmount: [item?.taxAmount ?? 0],
            totalAmount: [item?.totalAmount ?? 0]
        });
    }

    addItem(): void {
        this.items.push(this.createItemForm());
    }

    removeItem(index: number): void {
        this.items.removeAt(index);
        this.calculateTotals();
    }

    onProductChange(index: number): void {
        const item = this.items.at(index) as FormGroup;
        const productId = Number(item.get('productId')?.value);

        const product = this.products.find(
            p => p.id === productId
        );

        if (!product) {
            item.patchValue({
                productName: '',
                sku: '',
                unitPrice: 0,
                taxRate: 0,
                taxAmount: 0,
                totalAmount: 0
            });

            this.calculateTotals();
            return;
        }

        item.patchValue({
            productName: product.name,
            sku: product.sku,
            unitPrice: product.sellingPrice,
            taxRate: product.taxRate
        });

        this.calculateItem(index);
    }

    calculateItem(index: number): void {
        const item = this.items.at(index) as FormGroup;

        const quantity = Number(item.get('quantity')?.value) || 0;
        const unitPrice = Number(item.get('unitPrice')?.value) || 0;
        const taxRate = Number(item.get('taxRate')?.value) || 0;
        const discountAmount =
            Number(item.get('discountAmount')?.value) || 0;

        const lineSubtotal = quantity * unitPrice;
        const taxableAmount = Math.max(
            lineSubtotal - discountAmount,
            0
        );
        const lineTax = taxableAmount * taxRate / 100;
        const lineTotal = taxableAmount + lineTax;

        item.patchValue(
            {
                taxAmount: lineTax,
                totalAmount: lineTotal
            },
            { emitEvent: false }
        );

        this.calculateTotals();
    }

    calculateTotals(): void {
        let subtotal = 0;
        let taxAmount = 0;
        let discountAmount = 0;
        let totalAmount = 0;

        this.items.controls.forEach(control => {
            const item = control as FormGroup;

            const quantity = Number(item.get('quantity')?.value) || 0;
            const unitPrice = Number(item.get('unitPrice')?.value) || 0;

            subtotal += quantity * unitPrice;
            taxAmount += Number(item.get('taxAmount')?.value) || 0;
            discountAmount += Number(item.get('discountAmount')?.value) || 0;
            totalAmount += Number(item.get('totalAmount')?.value) || 0;
        });

        this.subtotal = subtotal;
        this.taxAmount = taxAmount;
        this.discountAmount = discountAmount;
        this.totalAmount = totalAmount;
    }

    saveInvoice(): void {
        this.errorMessage = '';

        if (this.invoiceForm.invalid) {
            this.invoiceForm.markAllAsTouched();
            this.errorMessage = 'Please correct the highlighted fields.';
            return;
        }

        if (this.items.length === 0) {
            this.errorMessage = 'Add at least one invoice item.';
            return;
        }

        this.isSaving = true;

        const formValue = this.invoiceForm.value;

        const selectedCustomer = this.customers.find(
            customer => customer.id === Number(formValue.customerId)
        );

        const invoiceData: Partial<Invoice> = {
            customerId: Number(formValue.customerId),
            customerName: selectedCustomer?.name
                ?? this.invoice?.customerName
                ?? '',
            invoiceDate: formValue.invoiceDate,
            dueDate: formValue.dueDate || null,
            status: formValue.status,
            subtotal: this.subtotal,
            taxAmount: this.taxAmount,
            discountAmount: this.discountAmount,
            totalAmount: this.totalAmount,
            notes: formValue.notes ?? ''
        };

        const invoiceItems = this.items.controls.map(control => {
            const item = control.value;

            return {
                productId: Number(item.productId),
                productName: item.productName,
                sku: item.sku,
                quantity: Number(item.quantity),
                unitPrice: Number(item.unitPrice),
                taxRate: Number(item.taxRate),
                taxAmount: Number(item.taxAmount),
                discountAmount: Number(item.discountAmount),
                totalAmount: Number(item.totalAmount)
            };
        });

        this.invoiceService.updateInvoice(
            this.invoiceId,
            invoiceData,
            invoiceItems
        ).subscribe({
            next: () => {
                this.isSaving = false;

                this.router.navigate([
                    '/invoices',
                    this.invoiceId
                ]);
            },
            error: () => {
                this.isSaving = false;
                this.errorMessage = 'Unable to update invoice.';
            }
        });
    }

    cancel(): void {
        this.router.navigate([
            '/invoices',
            this.invoiceId
        ]);
    }

    private toDateInputValue(date: string): string {
        return date ? date.substring(0, 10) : '';
    }
}
