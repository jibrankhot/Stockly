
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { Customer } from '../../../../../shared/models/customer';
import { Invoice } from '../../../../../shared/models/invoice';
import { InvoiceItem } from '../../../../../shared/models/invoice-item';
import { Product } from '../../../../../shared/models/product';

import { InvoiceService } from '../../services/invoice.service';
import { CustomerService } from '../../../../customers/services/customer.service';
import { ProductService } from '../../../../products/services/product.service';

@Component({
  selector: 'app-invoice-create',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './invoice-create.component.html',
  styleUrl: './invoice-create.component.scss'
})
export class InvoiceCreateComponent implements OnInit {

  invoiceForm: FormGroup;

  customers: Customer[] = [];
  products: Product[] = [];

  isLoadingCustomers = false;
  isLoadingProducts = false;
  isSubmitting = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly router: Router,
    private readonly customerService: CustomerService,
    private readonly productService: ProductService,
    private readonly invoiceService: InvoiceService
  ) {
    this.invoiceForm = this.fb.group({
      invoiceNumber: ['', Validators.required],
      customerId: [null, Validators.required],
      invoiceDate: ['', Validators.required],
      dueDate: [''],
      status: ['draft', Validators.required],

      items: this.fb.array([]),

      subtotal: [0],
      taxAmount: [0],
      discountAmount: [0],
      totalAmount: [0],

      notes: ['']
    });
  }

  ngOnInit(): void {
    this.setDefaultInvoiceNumber();
    this.setDefaultInvoiceDate();

    this.loadCustomers();
    this.loadProducts();

    this.addItem();
  }

  get items(): FormArray {
    return this.invoiceForm.get('items') as FormArray;
  }

  loadCustomers(): void {
    this.isLoadingCustomers = true;

    this.customerService.getCustomers().subscribe({
      next: customers => {
        this.customers = customers.filter(
          customer => customer.isActive
        );

        this.isLoadingCustomers = false;
      },
      error: error => {
        console.error('Error loading customers:', error);
        this.isLoadingCustomers = false;
      }
    });
  }

  loadProducts(): void {
    this.isLoadingProducts = true;

    this.productService.getProducts().subscribe({
      next: products => {
        this.products = products.filter(
          product => product.isActive
        );

        this.isLoadingProducts = false;
      },
      error: error => {
        console.error('Error loading products:', error);
        this.isLoadingProducts = false;
      }
    });
  }

  private createItem(): FormGroup {
    return this.fb.group({
      productId: [
        null,
        Validators.required
      ],
      productName: [
        '',
        Validators.required
      ],
      sku: [''],
      quantity: [
        1,
        [
          Validators.required,
          Validators.min(1)
        ]
      ],
      unitPrice: [
        0,
        [
          Validators.required,
          Validators.min(0)
        ]
      ],
      taxRate: [
        0,
        [
          Validators.required,
          Validators.min(0),
          Validators.max(100)
        ]
      ],
      taxAmount: [0],
      discountAmount: [
        0,
        Validators.min(0)
      ],
      totalAmount: [0]
    });
  }

  onProductChange(index: number): void {
    const item = this.items.at(index);

    const productId = Number(
      item.get('productId')?.value
    );

    const product = this.products.find(
      product => product.id === productId
    );

    if (!product) {
      return;
    }

    item.patchValue({
      productName: product.name,
      sku: product.sku,
      unitPrice: product.sellingPrice,
      taxRate: product.taxRate
    });

    this.calculateItemTotal(index);
  }

  addItem(): void {
    this.items.push(this.createItem());
    this.calculateTotals();
  }

  removeItem(index: number): void {
    if (this.items.length === 1) {
      return;
    }

    this.items.removeAt(index);
    this.calculateTotals();
  }

  calculateItemTotal(index: number): void {
    const item = this.items.at(index);

    const quantity = Number(
      item.get('quantity')?.value || 0
    );

    const unitPrice = Number(
      item.get('unitPrice')?.value || 0
    );

    const taxRate = Number(
      item.get('taxRate')?.value || 0
    );

    const discountAmount = Number(
      item.get('discountAmount')?.value || 0
    );

    const subtotal = quantity * unitPrice;

    const taxableAmount = Math.max(
      subtotal - discountAmount,
      0
    );

    const taxAmount = taxableAmount * taxRate / 100;
    const totalAmount = taxableAmount + taxAmount;

    item.patchValue(
      {
        taxAmount: this.roundNumber(taxAmount),
        totalAmount: this.roundNumber(totalAmount)
      },
      {
        emitEvent: false
      }
    );

    this.calculateTotals();
  }

  calculateTotals(): void {
    let subtotal = 0;
    let taxAmount = 0;
    let discountAmount = 0;

    this.items.controls.forEach(item => {
      const quantity = Number(
        item.get('quantity')?.value || 0
      );

      const unitPrice = Number(
        item.get('unitPrice')?.value || 0
      );

      subtotal += quantity * unitPrice;

      taxAmount += Number(
        item.get('taxAmount')?.value || 0
      );

      discountAmount += Number(
        item.get('discountAmount')?.value || 0
      );
    });

    const totalAmount =
      subtotal -
      discountAmount +
      taxAmount;

    this.invoiceForm.patchValue(
      {
        subtotal: this.roundNumber(subtotal),
        taxAmount: this.roundNumber(taxAmount),
        discountAmount: this.roundNumber(discountAmount),
        totalAmount: this.roundNumber(totalAmount)
      },
      {
        emitEvent: false
      }
    );
  }

  submit(): void {
    if (this.invoiceForm.invalid) {
      this.invoiceForm.markAllAsTouched();

      this.items.controls.forEach(item => {
        item.markAllAsTouched();
      });

      return;
    }

    this.isSubmitting = true;

    const formValue = this.invoiceForm.getRawValue();

    const selectedCustomer = this.customers.find(
      customer => customer.id === Number(formValue.customerId)
    );

    const invoiceData: Partial<Invoice> = {
      invoiceNumber: formValue.invoiceNumber,
      customerId: Number(formValue.customerId),
      customerName: selectedCustomer?.name ?? '',
      invoiceDate: formValue.invoiceDate,
      dueDate: formValue.dueDate,
      status: formValue.status,
      subtotal: Number(formValue.subtotal),
      taxAmount: Number(formValue.taxAmount),
      discountAmount: Number(formValue.discountAmount),
      totalAmount: Number(formValue.totalAmount),
      notes: formValue.notes
    };

    const invoiceItems: Omit<InvoiceItem, 'id' | 'invoiceId'>[] =
      formValue.items.map((item: InvoiceItem) => ({
        productId: Number(item.productId),
        productName: item.productName,
        sku: item.sku,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: Number(item.taxRate),
        taxAmount: Number(item.taxAmount),
        discountAmount: Number(item.discountAmount),
        totalAmount: Number(item.totalAmount)
      }));

    this.invoiceService.createInvoice(
      invoiceData,
      invoiceItems
    ).subscribe({
      next: invoice => {
        this.isSubmitting = false;

        this.router.navigate([
          '/invoices',
          invoice.id
        ]);
      },
      error: error => {
        console.error('Error creating invoice:', error);
        this.isSubmitting = false;
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/invoices']);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.invoiceForm.get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );
  }

  isItemFieldInvalid(
    index: number,
    fieldName: string
  ): boolean {
    const field = this.items.at(index).get(fieldName);

    return !!(
      field &&
      field.invalid &&
      (field.dirty || field.touched)
    );
  }

  getItemTotal(index: number): number {
    return Number(
      this.items.at(index).get('totalAmount')?.value || 0
    );
  }

  private setDefaultInvoiceNumber(): void {
    this.invoiceForm.patchValue({
      invoiceNumber: this.generateInvoiceNumber()
    });
  }

  private setDefaultInvoiceDate(): void {
    const today = new Date().toISOString().split('T')[0];

    this.invoiceForm.patchValue({
      invoiceDate: today
    });
  }

  private generateInvoiceNumber(): string {
    const date = new Date();
    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1
    ).padStart(2, '0');

    const day = String(
      date.getDate()
    ).padStart(2, '0');

    const time = String(
      date.getTime()
    ).slice(-5);

    return `INV-${year}${month}${day}-${time}`;
  }

  private roundNumber(value: number): number {
    return Math.round(
      (value + Number.EPSILON) * 100
    ) / 100;
  }
}
