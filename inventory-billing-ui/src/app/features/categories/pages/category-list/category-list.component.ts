
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
  imports: [DatePipe, FormsModule, RouterLink],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListComponent implements OnInit {
  private readonly categoryService = inject(CategoryService);
  private readonly router = inject(Router);
  private readonly modalService = inject(ModalService);
  private readonly notificationService = inject(NotificationService);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  categories: Category[] = [];

  searchTerm = '';
  selectedStatus: 'all' | 'active' | 'inactive' = 'all';

  isLoading = false;
  loadError = false;

  readonly deletingCategoryIds = new Set<number>();

  // Pagination
  currentPage = 1;
  pageSize = 10;
  readonly pageSizeOptions = [5, 10, 20, 50];

  ngOnInit(): void {
    this.loadCategories();
  }

  get filteredCategories(): Category[] {
    const search = this.searchTerm.trim().toLowerCase();

    return this.categories.filter((category) => {
      const name = (category.name ?? '').toLowerCase();
      const description = (category.description ?? '').toLowerCase();

      const matchesSearch =
        !search ||
        name.includes(search) ||
        description.includes(search);

      const matchesStatus =
        this.selectedStatus === 'all' ||
        (this.selectedStatus === 'active' && category.isActive) ||
        (this.selectedStatus === 'inactive' && !category.isActive);

      return matchesSearch && matchesStatus;
    });
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredCategories.length / this.pageSize),
    );
  }

  get paginatedCategories(): Category[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;

    return this.filteredCategories.slice(
      startIndex,
      startIndex + this.pageSize,
    );
  }

  get pageNumbers(): number[] {
    return Array.from(
      { length: this.totalPages },
      (_, index) => index + 1,
    );
  }

  get paginationStart(): number {
    if (this.filteredCategories.length === 0) {
      return 0;
    }

    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get paginationEnd(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.filteredCategories.length,
    );
  }

  changePageSize(size: number): void {
    if (!this.pageSizeOptions.includes(size)) {
      return;
    }

    this.pageSize = size;
    this.currentPage = 1;
    this.changeDetectorRef.markForCheck();
  }

  goToPage(page: number): void {
    if (!Number.isInteger(page) || page < 1 || page > this.totalPages) {
      return;
    }

    this.currentPage = page;
    this.changeDetectorRef.markForCheck();
  }

  loadCategories(): void {
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    this.loadError = false;
    this.changeDetectorRef.markForCheck();

    this.categoryService
      .getCategories()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
      )
      .subscribe({
        next: (categories) => {
          this.categories = categories ?? [];
          this.currentPage = 1;
          this.loadError = false;
          this.changeDetectorRef.markForCheck();
        },
        error: () => {
          this.loadError = true;
          this.changeDetectorRef.markForCheck();
        },
      });
  }

  viewCategory(category: Category): void {
    void this.router.navigate(['/categories', category.id]);
  }

  editCategory(category: Category): void {
    void this.router.navigate([
      '/categories',
      category.id,
      'edit',
    ]);
  }

  deleteCategory(category: Category): void {
    if (this.deletingCategoryIds.has(category.id)) {
      return;
    }

    this.modalService
      .open(
        'Delete Category?',
        `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
        'Delete Category',
        'Cancel',
        'danger',
      )
      .subscribe((confirmed) => {
        if (!confirmed || this.deletingCategoryIds.has(category.id)) {
          return;
        }

        this.deletingCategoryIds.add(category.id);
        this.changeDetectorRef.markForCheck();

        this.categoryService
          .deleteCategory(category.id)
          .pipe(
            finalize(() => {
              this.deletingCategoryIds.delete(category.id);
              this.changeDetectorRef.markForCheck();
            }),
          )
          .subscribe({
            next: () => {
              this.categories = this.categories.filter(
                (item) => item.id !== category.id,
              );

              // Keep the current page valid after deletion.
              this.currentPage = Math.min(
                this.currentPage,
                this.totalPages,
              );

              this.notificationService.success(
                `Category "${category.name}" deleted successfully.`,
              );

              this.changeDetectorRef.markForCheck();
            },
            error: () => {
              this.notificationService.error(
                `Unable to delete "${category.name}". Please try again.`,
              );

              this.changeDetectorRef.markForCheck();
            },
          });
      });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedStatus = 'all';
    this.currentPage = 1;
    this.changeDetectorRef.markForCheck();
  }

  /**
   * Keep pagination valid when search or status filters change.
   * Call this from the corresponding ngModelChange bindings.
   */
  onFiltersChanged(): void {
    this.currentPage = 1;
    this.changeDetectorRef.markForCheck();
  }
}
