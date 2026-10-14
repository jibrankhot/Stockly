
import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  CustomerService,
  CustomerImportRow,
  CustomerImportResponse,
  CustomerImportResult
} from '../../services/customer.service';

import { Customer } from '../../../../shared/models/customer';
import { ModalService } from '../../../../core/services/modal.service';
import { NotificationService } from '../../../../core/services/notification.service';

interface CustomerCsvPreviewRow extends CustomerImportRow {
  rowNumber: number;
  errors: string[];
}

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterLink, FormsModule],
  templateUrl: './customer-list.component.html',
  styleUrl: './customer-list.component.scss'
})
export class CustomerListComponent implements OnInit {
  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];

  searchTerm = '';
  statusFilter = 'all';

  isLoading = false;
  errorMessage = '';
  isDeletingCustomerId: number | null = null;

  // Compact import panel
  isImportPanelOpen = false;
  selectedCsvFile: File | null = null;
  csvPreviewRows: CustomerCsvPreviewRow[] = [];
  csvFileError = '';
  isReadingCsv = false;
  isImportingCustomers = false;
  importResponse: CustomerImportResponse | null = null;
  importErrorMessage = '';

  // Pagination
  pageSize = 10;
  currentPage = 1;
  readonly pageSizeOptions = [10, 15, 25, 50];

  private readonly maxImportRows = 500;

  constructor(
    private readonly customerService: CustomerService,
    private readonly modalService: ModalService,
    private readonly notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.getCustomers()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: customers => {
          this.customers = customers ?? [];
          this.applyFilters();
        },
        error: () => {
          this.errorMessage = 'Unable to load customers.';
          this.notificationService.error(this.errorMessage);
        }
      });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredCustomers = this.customers.filter(customer => {
      const matchesSearch =
        !search ||
        (customer.code ?? '').toLowerCase().includes(search) ||
        (customer.name ?? '').toLowerCase().includes(search) ||
        (customer.email ?? '').toLowerCase().includes(search) ||
        (customer.phone ?? '').toLowerCase().includes(search);

      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && customer.isActive) ||
        (this.statusFilter === 'inactive' && !customer.isActive);

      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.applyFilters();
  }

  get paginatedCustomers(): Customer[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredCustomers.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCustomers.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    const start = Math.max(1, Math.min(this.currentPage - 2, this.totalPages - 4));
    const end = Math.min(this.totalPages, start + 4);

    return Array.from(
      { length: end - start + 1 },
      (_, index) => start + index
    );
  }

  get pageStart(): number {
    return this.filteredCustomers.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredCustomers.length
    );
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
  }

  changePageSize(value: string | number): void {
    const size = Number(value);

    if (!this.pageSizeOptions.includes(size)) {
      return;
    }

    this.pageSize = size;
    this.currentPage = 1;
  }

  toggleImportPanel(): void {
    this.isImportPanelOpen = !this.isImportPanelOpen;
  }

  onCsvFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.resetImportState();

    if (!file) {
      this.selectedCsvFile = null;
      return;
    }

    if (!file.name.toLowerCase().endsWith('.csv')) {
      this.csvFileError = 'Please select a CSV file.';
      input.value = '';
      return;
    }

    this.selectedCsvFile = file;
    this.isReadingCsv = true;

    file.text()
      .then(content => this.parseCsvFile(content))
      .catch(() => {
        this.csvFileError = 'Unable to read the selected file.';
      })
      .finally(() => {
        this.isReadingCsv = false;
      });
  }

  private parseCsvFile(content: string): void {
    this.csvPreviewRows = [];
    this.csvFileError = '';

    const records = this.parseCsv(content);

    if (records.length < 2) {
      this.csvFileError =
        'The CSV file must contain a header and at least one customer.';
      return;
    }

    const headers = records[0].map(header => this.normalizeHeader(header));

    const hasCode = headers.some(header =>
      ['customercode', 'code', 'customer_code'].includes(header)
    );

    if (!hasCode || !headers.includes('name')) {
      this.csvFileError =
        'Missing required columns: CustomerCode and Name. Use the provided template.';
      return;
    }

    const dataRecords = records.slice(1).filter(record =>
      record.some(value => value.trim() !== '')
    );

    if (dataRecords.length === 0) {
      this.csvFileError = 'No customer records were found.';
      return;
    }

    if (dataRecords.length > this.maxImportRows) {
      this.csvFileError =
        `The file contains ${dataRecords.length} records. Maximum: ${this.maxImportRows}.`;
      return;
    }

    const seenCodes = new Set<string>();
    const existingCodes = new Set(
      this.customers.map(customer => (customer.code ?? '').trim().toLowerCase())
    );

    this.csvPreviewRows = dataRecords.map((record, index) => {
      const values: Record<string, string> = {};

      headers.forEach((header, columnIndex) => {
        values[header] = (record[columnIndex] ?? '').trim();
      });

      const customerCode =
        values['customercode'] ||
        values['code'] ||
        values['customer_code'] ||
        '';

      const name = values['name'] || '';
      const normalizedCode = customerCode.toLowerCase();
      const errors: string[] = [];

      if (!customerCode) {
        errors.push('Customer code is required.');
      }

      if (!name) {
        errors.push('Customer name is required.');
      }

      if (customerCode && existingCodes.has(normalizedCode)) {
        errors.push('This customer code already exists.');
      }

      if (customerCode && seenCodes.has(normalizedCode)) {
        errors.push('Duplicate customer code in this file.');
      }

      if (customerCode) {
        seenCodes.add(normalizedCode);
      }

      const email = values['email'] || '';

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Invalid email address.');
      }

      const activeValue = (values['isactive'] || '').toLowerCase();
      let isActive: boolean | undefined;

      if (activeValue) {
        if (['true', 'yes', '1', 'active'].includes(activeValue)) {
          isActive = true;
        } else if (['false', 'no', '0', 'inactive'].includes(activeValue)) {
          isActive = false;
        } else {
          errors.push('Invalid isActive value.');
        }
      }

      return {
        rowNumber: index + 2,
        customerCode,
        name,
        email,
        phone: values['phone'] || '',
        address: values['address'] || '',
        city: values['city'] || '',
        state: values['state'] || '',
        postalCode: values['postalcode'] || values['postal_code'] || '',
        taxNumber: values['taxnumber'] || values['tax_number'] || '',
        isActive,
        errors
      };
    });
  }

  private parseCsv(content: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let field = '';
    let insideQuotes = false;
    const input = content.replace(/^\uFEFF/, '');

    for (let index = 0; index < input.length; index++) {
      const char = input[index];
      const next = input[index + 1];

      if (char === '"') {
        if (insideQuotes && next === '"') {
          field += '"';
          index++;
        } else {
          insideQuotes = !insideQuotes;
        }
      } else if (char === ',' && !insideQuotes) {
        row.push(field);
        field = '';
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
        if (char === '\r' && next === '\n') {
          index++;
        }

        row.push(field);
        rows.push(row);
        row = [];
        field = '';
      } else {
        field += char;
      }
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field);
      rows.push(row);
    }

    return rows;
  }

  private normalizeHeader(header: string): string {
    return header
      .trim()
      .replace(/^\uFEFF/, '')
      .replace(/[\s-]/g, '')
      .toLowerCase();
  }

  get validCsvRowCount(): number {
    return this.csvPreviewRows.filter(row => row.errors.length === 0).length;
  }

  get invalidCsvRowCount(): number {
    return this.csvPreviewRows.filter(row => row.errors.length > 0).length;
  }

  importCsvCustomers(): void {
    if (
      this.isImportingCustomers ||
      this.isReadingCsv ||
      this.csvPreviewRows.length === 0 ||
      this.invalidCsvRowCount > 0
    ) {
      return;
    }

    this.importErrorMessage = '';
    this.importResponse = null;
    this.isImportingCustomers = true;

    const customers: CustomerImportRow[] = this.csvPreviewRows.map(row => ({
      customerCode: row.customerCode,
      name: row.name,
      email: row.email || '',
      phone: row.phone || '',
      address: row.address || '',
      city: row.city || '',
      state: row.state || '',
      postalCode: row.postalCode || '',
      taxNumber: row.taxNumber || '',
      isActive: row.isActive ?? true
    }));

    this.customerService.importCustomers(customers)
      .pipe(finalize(() => this.isImportingCustomers = false))
      .subscribe({
        next: response => {
          this.importResponse = response;

          if (response.data.importedCount > 0) {
            this.notificationService.success(
              `${response.data.importedCount} customer(s) imported successfully.`
            );
            this.loadCustomers();
          } else {
            this.notificationService.error(
              'No customers were imported. Check the results below.'
            );
          }
        },
        error: error => {
          this.importErrorMessage =
            error?.error?.message || 'Customer import failed. Please try again.';
          this.notificationService.error(this.importErrorMessage);
        }
      });
  }

  clearCsvSelection(fileInput?: HTMLInputElement): void {
    if (this.isImportingCustomers || this.isReadingCsv) {
      return;
    }

    this.selectedCsvFile = null;
    this.resetImportState();

    if (fileInput) {
      fileInput.value = '';
    }
  }

  private resetImportState(): void {
    this.csvPreviewRows = [];
    this.csvFileError = '';
    this.importResponse = null;
    this.importErrorMessage = '';
  }

  getImportResultClass(result: CustomerImportResult): string {
    return `import-status-${result.status}`;
  }

  deleteCustomer(customer: Customer): void {
    if (this.isDeletingCustomerId !== null) {
      return;
    }

    this.modalService.open(
      'Delete Customer?',
      `Are you sure you want to delete "${customer.name}"? This action cannot be undone.`,
      'Delete Customer',
      'Cancel',
      'danger'
    ).subscribe(confirmed => {
      if (confirmed) {
        this.performDelete(customer);
      }
    });
  }

  private performDelete(customer: Customer): void {
    if (this.isDeletingCustomerId !== null) {
      return;
    }

    this.isDeletingCustomerId = customer.id;
    this.errorMessage = '';

    this.customerService.deleteCustomer(customer.id)
      .pipe(finalize(() => this.isDeletingCustomerId = null))
      .subscribe({
        next: success => {
          if (!success) {
            this.errorMessage = 'Unable to delete customer.';
            this.notificationService.error(this.errorMessage);
            return;
          }

          this.customers = this.customers.filter(item => item.id !== customer.id);
          this.applyFilters();
          this.notificationService.success('Customer deleted successfully.');
        },
        error: () => {
          this.errorMessage = 'Unable to delete customer.';
          this.notificationService.error(this.errorMessage);
        }
      });
  }

  get activeCustomerCount(): number {
    return this.customers.filter(customer => customer.isActive).length;
  }

  get inactiveCustomerCount(): number {
    return this.customers.filter(customer => !customer.isActive).length;
  }

  get totalCustomerCount(): number {
    return this.customers.length;
  }
}
