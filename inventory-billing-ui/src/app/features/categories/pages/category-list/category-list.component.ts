import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { Category } from '../../../../shared/models/category';
import { CategoryService } from '../../services/category.service';
import { ModalService } from '../../../../core/services/modal.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService =
    inject(CategoryService);

  private readonly router =
    inject(Router);

  private readonly modalService =
    inject(ModalService);

  private readonly notificationService =
    inject(NotificationService);

  private readonly changeDetectorRef =
    inject(ChangeDetectorRef);

  categories: Category[] = [];
  searchTerm = '';
  selectedStatus = 'all';
  isLoading = false;

  ngOnInit(): void {
    this.loadCategories();
  }

  get filteredCategories(): Category[] {
    const search = this.searchTerm
      .trim()
      .toLowerCase();

    return this.categories.filter((category) => {
      const matchesSearch =
        !search ||
        category.name
          .toLowerCase()
          .includes(search) ||
        category.description
          .toLowerCase()
          .includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (
          this.selectedStatus === 'active' &&
          category.isActive
        ) ||
        (
          this.selectedStatus === 'inactive' &&
          !category.isActive
        );

      return matchesSearch && matchesStatus;
    });
  }

  loadCategories(): void {
    this.isLoading = true;

    this.categoryService
      .getCategories()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories;
          this.changeDetectorRef.markForCheck();
        },

        error: () => {
          // The HTTP error interceptor handles
          // the error notification.
        },
      });
  }

  viewCategory(category: Category): void {
    void this.router.navigate([
      '/categories',
      category.id,
    ]);
  }

  editCategory(category: Category): void {
    void this.router.navigate([
      '/categories',
      category.id,
      'edit',
    ]);
  }

  deleteCategory(category: Category): void {
    this.modalService
      .open(
        'Delete Category?',
        `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
        'Delete Category',
        'Cancel',
        'danger'
      )
      .subscribe((confirmed) => {
        if (!confirmed) {
          return;
        }

        this.categoryService
          .deleteCategory(category.id)
          .subscribe({
            next: () => {
              this.categories =
                this.categories.filter(
                  (item) =>
                    item.id !== category.id
                );

              this.notificationService.success(
                `Category "${category.name}" deleted successfully.`
              );

              this.changeDetectorRef.markForCheck();
            },

            error: () => {
              // The HTTP error interceptor handles
              // the error notification.
            },
          });
      });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';

    this.changeDetectorRef.markForCheck();
  }
}