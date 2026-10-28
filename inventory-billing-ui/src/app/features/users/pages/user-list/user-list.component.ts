
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { User } from '../../../../shared/models/user';
import { UserService } from '../../services/user.service';
import { ModalService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  paginatedUsers: User[] = [];

  searchTerm = '';
  selectedStatus = 'all';

  loading = true;
  errorMessage = '';

  // Pagination — aligned with Stock Movements.
  readonly pageSizeOptions = [5, 10, 25, 50];
  pageSize = 5;
  currentPage = 1;

  constructor(
    private readonly userService: UserService,
    private readonly modalService: ModalService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.errorMessage = '';

    this.userService.getUsers().subscribe({
      next: (users) => {
        this.users = users ?? [];
        this.applyFilters();
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'Unable to load users.';
        this.loading = false;
      }
    });
  }

  applyFilters(): void {
    const search = this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users.filter((user) => {
      const matchesSearch =
        !search ||
        (user.username ?? '').toLowerCase().includes(search) ||
        (user.fullName ?? '').toLowerCase().includes(search) ||
        (user.email ?? '').toLowerCase().includes(search) ||
        (user.roleName ?? '').toLowerCase().includes(search) ||
        (user.phone ?? '').toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && user.isActive) ||
        (this.selectedStatus === 'inactive' && !user.isActive);

      return matchesSearch && matchesStatus;
    });

    // Reset pagination whenever search or filters change.
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
    return (
      this.searchTerm.trim().length > 0 ||
      this.selectedStatus !== 'all'
    );
  }

  updatePagination(): void {
    // Keep the current page valid if the dataset changes.
    const totalPages = this.totalPages;

    if (this.currentPage > totalPages) {
      this.currentPage = totalPages;
    }

    const startIndex = (this.currentPage - 1) * this.pageSize;

    this.paginatedUsers = this.filteredUsers.slice(
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
    return Math.max(
      1,
      Math.ceil(this.filteredUsers.length / this.pageSize)
    );
  }

  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1
    );
  }

  get paginationStart(): number {
    if (this.filteredUsers.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredUsers.length
    );
  }

  deleteUser(user: User): void {
    this.modalService
      .open(
        'Delete User?',
        `Are you sure you want to delete "${user.fullName}"?`,
        'Delete User',
        'Cancel',
        'danger'
      )
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.userService.deleteUser(user.id).subscribe({
          next: (success) => {
            if (success) {
              this.loadUsers();
            } else {
              this.errorMessage = 'Unable to delete user.';
            }
          },
          error: () => {
            this.errorMessage = 'Unable to delete user.';
          }
        });
      });
  }

  get activeUsers(): number {
    return this.users.filter((user) => user.isActive).length;
  }

  get inactiveUsers(): number {
    return this.users.filter((user) => !user.isActive).length;
  }

  get totalUsers(): number {
    return this.users.length;
  }

  trackByUser(
    index: number,
    user: User
  ): string | number {
    return user.id ?? index;
  }
}
