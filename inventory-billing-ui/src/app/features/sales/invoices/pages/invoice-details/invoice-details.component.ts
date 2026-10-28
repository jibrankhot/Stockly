
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Invoice } from '../../../../../shared/models/invoice';
import { InvoiceItem } from '../../../../../shared/models/invoice-item';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-invoice-details',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './invoice-details.component.html',
  styleUrl: './invoice-details.component.scss'
})
export class InvoiceDetailsComponent implements OnInit {
  invoice: Invoice | null = null;
  invoiceItems: InvoiceItem[] = [];

  isLoading = true;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid invoice ID.';
      this.isLoading = false;
      return;
    }

    this.loadInvoice(id);
  }

  loadInvoice(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.invoice = null;
    this.invoiceItems = [];

    this.invoiceService.getInvoiceById(id).subscribe({
      next: (invoice) => {
        this.invoice = invoice;

        if (!invoice) {
          this.errorMessage = 'Invoice not found.';
          this.isLoading = false;
          return;
        }

        this.loadInvoiceItems(invoice.id);
      },
      error: () => {
        this.errorMessage = 'Unable to load invoice.';
        this.isLoading = false;
      }
    });
  }

  loadInvoiceItems(invoiceId: number): void {
    this.invoiceService.getInvoiceItems(invoiceId).subscribe({
      next: (items) => {
        this.invoiceItems = items ?? [];
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load invoice items.';
        this.isLoading = false;
      }
    });
  }

  getStatusLabel(status: Invoice['status']): string {
    switch (status) {
      case 'draft':
        return 'Draft';

      case 'issued':
        return 'Issued';

      case 'partially-paid':
        return 'Partially Paid';

      case 'paid':
        return 'Paid';

      case 'cancelled':
        return 'Cancelled';

      default:
        return status;
    }
  }

  getStatusClass(status: Invoice['status']): string {
    return `status-${status}`;
  }

  getItemsSubtotal(): number {
    return this.invoiceItems.reduce(
      (total, item) => total + item.quantity * item.unitPrice,
      0
    );
  }

  getItemsTax(): number {
    return this.invoiceItems.reduce(
      (total, item) => total + item.taxAmount,
      0
    );
  }

  getItemsDiscount(): number {
    return this.invoiceItems.reduce(
      (total, item) => total + item.discountAmount,
      0
    );
  }

  getItemsTotal(): number {
    return this.invoiceItems.reduce(
      (total, item) => total + item.totalAmount,
      0
    );
  }
}
