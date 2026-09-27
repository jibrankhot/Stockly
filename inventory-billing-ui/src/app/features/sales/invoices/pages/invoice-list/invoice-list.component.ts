
import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

import { Invoice, InvoiceStatus } from '../../../../../shared/models/invoice';
import { InvoiceService } from '../../services/invoice.service';
import { ModalService } from '../../../../../core/services/modal.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './invoice-list.component.html',
  styleUrl: './invoice-list.component.scss'
})
export class InvoiceListComponent implements OnInit {

  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];

  searchTerm = '';
  selectedStatus: InvoiceStatus | 'all' = 'all';

  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly router: Router,
    private readonly modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.loadInvoices();
  }

  loadInvoices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.invoiceService.getInvoices().subscribe({
      next: invoices => {
        this.invoices = invoices;
        this.applyFilters();
        this.isLoading = false;
      },
      error: error => {
        console.error('Error loading invoices:', error);

        this.errorMessage =
          'Unable to load invoices. Please try again.';

        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm
      .trim()
      .toLowerCase();

    this.filteredInvoices = this.invoices.filter(invoice => {

      const matchesSearch =
        !search ||
        invoice.invoiceNumber.toLowerCase().includes(search) ||
        invoice.customerName.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        invoice.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;

    this.searchTerm = input.value;

    this.applyFilters();
  }

  onStatusChange(event: Event): void {
    const select = event.target as HTMLSelectElement;

    this.selectedStatus =
      select.value as InvoiceStatus | 'all';

    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';

    this.applyFilters();
  }

  viewInvoice(invoice: Invoice): void {
    this.router.navigate([
      '/invoices',
      invoice.id
    ]);
  }

  editInvoice(invoice: Invoice): void {
    this.router.navigate([
      '/invoices',
      invoice.id,
      'edit'
    ]);
  }

  deleteInvoice(invoice: Invoice): void {
    this.modalService
      .open(
        'Delete Invoice?',
        `Are you sure you want to delete invoice "${invoice.invoiceNumber}"? This action cannot be undone.`,
        'Delete Invoice',
        'Cancel',
        'danger'
      )
      .subscribe(confirmed => {
        if (!confirmed) {
          return;
        }

        this.invoiceService
          .deleteInvoice(invoice.id)
          .subscribe({
            next: deleted => {
              if (!deleted) {
                return;
              }

              this.invoices =
                this.invoices.filter(
                  item => item.id !== invoice.id
                );

              this.applyFilters();
            },
            error: error => {
              console.error(
                'Error deleting invoice:',
                error
              );

              this.errorMessage =
                'Unable to delete the invoice. Please try again.';
            }
          });
      });
  }

  getStatusLabel(status: InvoiceStatus): string {
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

  getStatusClass(status: InvoiceStatus): string {
    return `status-${status}`;
  }

  get totalInvoices(): number {
    return this.invoices.length;
  }

  get draftInvoices(): number {
    return this.invoices.filter(
      invoice => invoice.status === 'draft'
    ).length;
  }

  get issuedInvoices(): number {
    return this.invoices.filter(
      invoice => invoice.status === 'issued'
    ).length;
  }

  get paidInvoices(): number {
    return this.invoices.filter(
      invoice => invoice.status === 'paid'
    ).length;
  }

  get totalInvoiceAmount(): number {
    return this.invoices.reduce(
      (total, invoice) =>
        total + invoice.totalAmount,
      0
    );
  }

  trackByInvoiceId(
    index: number,
    invoice: Invoice
  ): number {
    return invoice.id;
  }
}