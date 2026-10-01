import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

export interface PaginationChange {
  page: number;
  pageSize: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [],
  templateUrl: './pagination.component.html',
  styleUrl: './pagination.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  @Input() currentPage = 1;
  @Input() pageSize = 10;
  @Input() totalItems = 0;

  @Input() pageSizeOptions: readonly number[] = [
    10,
    25,
    50,
    100,
  ];

  @Input() maxVisiblePages = 5;

  @Output() readonly pageChange =
    new EventEmitter<PaginationChange>();

  get totalPages(): number {
    if (this.totalItems <= 0 || this.pageSize <= 0) {
      return 0;
    }

    return Math.ceil(
      this.totalItems / this.pageSize,
    );
  }

  get hasPreviousPage(): boolean {
    return this.currentPage > 1;
  }

  get hasNextPage(): boolean {
    return this.currentPage < this.totalPages;
  }

  get startItem(): number {
    if (this.totalItems === 0) {
      return 0;
    }

    return (
      (this.currentPage - 1) * this.pageSize + 1
    );
  }

  get endItem(): number {
    return Math.min(
      this.currentPage * this.pageSize,
      this.totalItems,
    );
  }

  get visiblePages(): number[] {
    const totalPages = this.totalPages;

    if (totalPages <= 0) {
      return [];
    }

    const maxPages = Math.max(
      1,
      Math.min(this.maxVisiblePages, totalPages),
    );

    let startPage = Math.max(
      1,
      this.currentPage -
      Math.floor(maxPages / 2),
    );

    let endPage = startPage + maxPages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(
        1,
        endPage - maxPages + 1,
      );
    }

    return Array.from(
      {
        length: endPage - startPage + 1,
      },
      (_, index) => startPage + index,
    );
  }

  goToPage(page: number): void {
    if (
      page < 1 ||
      page > this.totalPages ||
      page === this.currentPage
    ) {
      return;
    }

    this.emitChange(page, this.pageSize);
  }

  goToPreviousPage(): void {
    if (this.hasPreviousPage) {
      this.emitChange(
        this.currentPage - 1,
        this.pageSize,
      );
    }
  }

  goToNextPage(): void {
    if (this.hasNextPage) {
      this.emitChange(
        this.currentPage + 1,
        this.pageSize,
      );
    }
  }

  goToFirstPage(): void {
    if (this.hasPreviousPage) {
      this.emitChange(1, this.pageSize);
    }
  }

  goToLastPage(): void {
    if (this.hasNextPage) {
      this.emitChange(
        this.totalPages,
        this.pageSize,
      );
    }
  }

  onPageSizeChange(
    event: Event,
  ): void {
    const select =
      event.target as HTMLSelectElement;

    const newPageSize = Number(select.value);

    if (
      !Number.isFinite(newPageSize) ||
      newPageSize <= 0
    ) {
      return;
    }

    this.emitChange(1, newPageSize);
  }

  private emitChange(
    page: number,
    pageSize: number,
  ): void {
    this.pageChange.emit({
      page,
      pageSize,
    });
  }
}