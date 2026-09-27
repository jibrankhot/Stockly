import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
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

  searchTerm = '';
  selectedStatus = 'all';

  loading = false;
  errorMessage = '';

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

        this.users = users;
        this.applyFilters();

        this.loading = false;

      },

      error: () => {

        this.errorMessage =
          'Unable to load users.';

        this.loading = false;

      }

    });
  }

  applyFilters(): void {

    const search = this.searchTerm
      .trim()
      .toLowerCase();

    this.filteredUsers = this.users.filter(user => {

      const matchesSearch =
        !search ||
        user.username.toLowerCase().includes(search) ||
        user.fullName.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.roleName.toLowerCase().includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && user.isActive) ||
        (this.selectedStatus === 'inactive' && !user.isActive);

      return matchesSearch && matchesStatus;

    });
  }

  onSearch(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
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
      .subscribe(confirmed => {

        if (!confirmed) {
          return;
        }

        this.userService.deleteUser(user.id).subscribe({

          next: (success) => {

            if (success) {
              this.loadUsers();
            } else {
              this.errorMessage =
                'Unable to delete user.';
            }

          },

          error: () => {

            this.errorMessage =
              'Unable to delete user.';

          }

        });

      });
  }

  get activeUsers(): number {
    return this.users.filter(
      user => user.isActive
    ).length;
  }

  get inactiveUsers(): number {
    return this.users.filter(
      user => !user.isActive
    ).length;
  }

  get totalUsers(): number {
    return this.users.length;
  }

}