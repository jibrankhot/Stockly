
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface Role {
  id: number;
  name: string;
  description: string;
  userCount: number;
  isActive: boolean;
}

@Component({
  selector: 'app-role-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './role-list.component.html',
  styleUrl: './role-list.component.scss'
})
export class RoleListComponent {
  roles: Role[] = [
    {
      id: 1,
      name: 'Administrator',
      description: 'Full access to all Stockly modules.',
      userCount: 1,
      isActive: true
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Manage daily business operations.',
      userCount: 1,
      isActive: true
    },
    {
      id: 3,
      name: 'Sales Executive',
      description: 'Manage customers, invoices and sales.',
      userCount: 2,
      isActive: true
    },
    {
      id: 4,
      name: 'Inventory Executive',
      description: 'Manage products and inventory operations.',
      userCount: 1,
      isActive: true
    }
  ];

  filteredRoles: Role[] = [];
  paginatedRoles: Role[] = [];

  searchTerm = '';
  selectedStatus = 'all';

  readonly pageSizeOptions = [5, 10, 25, 50];
  pageSize = 5;
  currentPage = 1;

  constructor() {
    this.applyFilters();
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredRoles = this.roles.filter(role => {
      const matchesSearch =
        !search ||
        role.name.toLowerCase().includes(search) ||
        role.description.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && role.isActive) ||
        (this.selectedStatus === 'inactive' && !role.isActive);

      return matchesSearch && matchesStatus;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  hasActiveFilters(): boolean {
    return this.searchTerm.trim().length > 0 ||
      this.selectedStatus !== 'all';
  }

  toggleStatus(role: Role): void {
    role.isActive = !role.isActive;
    this.applyFilters();
  }

  updatePagination(): void {
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;

    this.paginatedRoles = this.filteredRoles.slice(
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
      page > this.totalPages
    ) {
      return;
    }

    this.currentPage = page;
    this.updatePagination();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredRoles.length / this.pageSize));
  }

  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  get paginationStart(): number {
    return this.filteredRoles.length === 0
      ? 0
      : (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredRoles.length
    );
  }

  get activeRoles(): number {
    return this.roles.filter(role => role.isActive).length;
  }

  get inactiveRoles(): number {
    return this.roles.filter(role => !role.isActive).length;
  }

  get totalRoles(): number {
    return this.roles.length;
  }

  trackByRole(_index: number, role: Role): number {
    return role.id;
  }
}
