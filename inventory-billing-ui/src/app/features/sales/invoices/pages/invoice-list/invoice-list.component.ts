import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import {
  Invoice,
  InvoiceStatus
} from '../../../../../shared/models/invoice';

import { InvoiceService } from '../../services/invoice.service';
import { ModalService } from '../../../../../core/services/modal.service';

@Component({
  selector: 'app-invoice-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
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
  paginatedInvoices: Invoice[] = [];

  searchTerm = '';
  selectedStatus: InvoiceStatus | 'all' = 'all';

  readonly pageSizeOptions = [5, 10, 25, 50];
  pageSize = 5;
  currentPage = 1;

  isLoading = true;
  errorMessage = '';

  constructor(
    private readonly invoiceService: InvoiceService,
    private readonly router: Router,
    private readonly modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.loadInvoices();
  }

  // Load invoices from the existing service.
  loadInvoices(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.invoiceService.getInvoices().subscribe({
      next: (invoices) => {
        this.invoices = invoices ?? [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading invoices:', error);
        this.errorMessage =
          'Unable to load invoices. Please try again.';
        this.isLoading = false;
      }
    });
  }

  refreshInvoices(): void {
    this.loadInvoices();
  }

  // Search and status filtering.
  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredInvoices = this.invoices.filter((invoice) => {
      const invoiceNumber = String(
        invoice.invoiceNumber ?? ''
      ).toLowerCase();

      const customerName = String(
        invoice.customerName ?? ''
      ).toLowerCase();

      const matchesSearch =
        !search ||
        invoiceNumber.includes(search) ||
        customerName.includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        invoice.status === this.selectedStatus;

      return matchesSearch && matchesStatus;
    });

    // Reset pagination whenever the filters change.
    this.currentPage = 1;
    this.updatePagination();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return (
      this.searchTerm.trim().length > 0 ||
      this.selectedStatus !== 'all'
    );
  }

  // Pagination.
  updatePagination(): void {
    const totalPages = Math.max(
      1,
      Math.ceil(this.filteredInvoices.length / this.pageSize)
    );

    // Keep the current page valid after data changes.
    this.currentPage = Math.min(
      Math.max(1, this.currentPage),
      totalPages
    );

    const startIndex = (this.currentPage - 1) * this.pageSize;

    this.paginatedInvoices = this.filteredInvoices.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }

  changePageSize(size: number | string): void {
    const parsedSize = Number(size);

    if (!this.pageSizeOptions.includes(parsedSize)) {
      return;
    }

    this.pageSize = parsedSize;
    this.currentPage = 1;
    this.updatePagination();
  }

  goToPage(page: number): void {
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.currentPage = page;
    this.updatePagination();
  }

  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredInvoices.length / this.pageSize)
    );
  }

  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  get paginationStart(): number {
    if (this.filteredInvoices.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredInvoices.length
    );
  }

  // Invoice actions.
  viewInvoice(invoice: Invoice): void {
    this.router.navigate(['/invoices', invoice.id]);
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
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.invoiceService.deleteInvoice(invoice.id).subscribe({
          next: (deleted) => {
            if (!deleted) {
              this.errorMessage =
                'The invoice could not be deleted. Please try again.';
              return;
            }

            this.invoices = this.invoices.filter(
              (item) => item.id !== invoice.id
            );

            this.errorMessage = '';
            this.applyFilters();
          },
          error: (error) => {
            console.error('Error deleting invoice:', error);
            this.errorMessage =
              'Unable to delete the invoice. Please try again.';
          }
        });
      });
  }

  // Status labels and CSS classes.
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
    // Must match the SCSS classes: status-paid,
    // status-issued, status-partially-paid, etc.
    return `status-${status}`;
  }

  // Summary cards.
  get totalInvoices(): number {
    return this.invoices.length;
  }

  get draftInvoices(): number {
    return this.invoices.filter(
      (invoice) => invoice.status === 'draft'
    ).length;
  }

  get issuedInvoices(): number {
    return this.invoices.filter(
      (invoice) => invoice.status === 'issued'
    ).length;
  }

  get paidInvoices(): number {
    return this.invoices.filter(
      (invoice) => invoice.status === 'paid'
    ).length;
  }

  get totalInvoiceAmount(): number {
    return this.invoices.reduce(
      (total, invoice) =>
        total + (Number(invoice.totalAmount) || 0),
      0
    );
  }

  // Efficient table row tracking.
  trackByInvoiceId(
    index: number,
    invoice: Invoice
  ): number {
    return invoice.id;
  }
}