
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Invoice } from '../../../../../shared/models/invoice';
import { InvoiceItem } from '../../../../../shared/models/invoice-item';
import { InvoiceService } from '../../services/invoice.service';

@Component({
  selector: 'app-invoice-print',
  standalone: true,
  imports: [CommonModule, DatePipe, DecimalPipe, RouterLink],
  templateUrl: './invoice-print.component.html',
  styleUrl: './invoice-print.component.scss'
})
export class InvoicePrintComponent implements OnInit {
  invoice: Invoice | null = null;
  invoiceItems: InvoiceItem[] = [];

  invoiceId = 0;
  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly route: ActivatedRoute,
    private readonly invoiceService: InvoiceService
  ) { }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));

    if (!Number.isInteger(id) || id <= 0) {
      this.errorMessage = 'Invalid invoice ID.';
      this.isLoading = false;
      return;
    }

    this.invoiceId = id;
    this.loadInvoice();
  }

  private loadInvoice(): void {
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
        this.loadInvoiceItems();
      },
      error: () => {
        this.errorMessage = 'Unable to load invoice. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private loadInvoiceItems(): void {
    this.invoiceService.getInvoiceItems(this.invoiceId).subscribe({
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

  printInvoice(): void {
    if (!this.invoice || this.isLoading || this.errorMessage) {
      return;
    }

    window.print();
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
}
