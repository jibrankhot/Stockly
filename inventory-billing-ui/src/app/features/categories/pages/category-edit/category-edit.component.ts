import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    OnInit,
    inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, distinctUntilChanged, finalize, map, of, switchMap, tap } from 'rxjs';

import {
    Category,
    UpdateCategoryRequest,
} from '../../../../shared/models/category';
import { CategoryService } from '../../services/category.service';
import { CategoryFormComponent } from '../../category-form/category-form.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-category-edit',
    standalone: true,
    imports: [CategoryFormComponent],
    templateUrl: './category-edit.component.html',
    styleUrl: './category-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryEditComponent implements OnInit {
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly categoryService = inject(CategoryService);
    private readonly router = inject(Router);
    private readonly notificationService = inject(NotificationService);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);

    category: Category | null = null;
    isLoading = false;
    isSubmitting = false;
    loadError = false;

    ngOnInit(): void {
        this.activatedRoute.paramMap
            .pipe(
                map((params) => Number(params.get('id'))),
                distinctUntilChanged(),
                tap((id) => {
                    this.category = null;
                    this.loadError = false;

                    if (!Number.isInteger(id) || id <= 0) {
                        this.isLoading = false;
                        this.changeDetectorRef.markForCheck();
                        this.notificationService.error('Invalid category ID.');
                        void this.router.navigate(['/categories']);
                        return;
                    }

                    this.isLoading = true;
                    this.changeDetectorRef.markForCheck();
                }),
                switchMap((id) => {
                    if (!Number.isInteger(id) || id <= 0) {
                        return of(null);
                    }

                    return this.categoryService.getCategoryById(id).pipe(
                        catchError(() => {
                            this.loadError = true;
                            return of(null);
                        }),
                        finalize(() => {
                            this.isLoading = false;
                            this.changeDetectorRef.markForCheck();
                        }),
                    );
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe((category) => {
                this.category = category;
                this.changeDetectorRef.markForCheck();
            });
    }

    onSubmit(categoryData: UpdateCategoryRequest): void {
        if (!this.category || this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;
        this.changeDetectorRef.markForCheck();

        this.categoryService
            .updateCategory(this.category.id, categoryData)
            .pipe(
                finalize(() => {
                    this.isSubmitting = false;
                    this.changeDetectorRef.markForCheck();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (updatedCategory) => {
                    this.notificationService.success(
                        `Category "${updatedCategory.name}" updated successfully.`,
                    );
                    void this.router.navigate(['/categories']);
                },
                error: () => {
                    this.notificationService.error(
                        'Unable to update category. Please check your information and try again.',
                    );
                },
            });
    }

    onCancel(): void {
        if (this.isSubmitting) {
            return;
        }

        if (!this.category) {
            this.goBack();
            return;
        }

        void this.router.navigate(['/categories', this.category.id]);
    }

    loadCategoryFromCurrentRoute(): void {
        const categoryId = Number(this.activatedRoute.snapshot.paramMap.get('id'));

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            this.goBack();
            return;
        }

        this.loadCategory(categoryId);
    }

    private loadCategory(id: number): void {
        this.category = null;
        this.isLoading = true;
        this.loadError = false;
        this.changeDetectorRef.markForCheck();

        this.categoryService
            .getCategoryById(id)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    this.changeDetectorRef.markForCheck();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (category) => {
                    this.category = category ?? null;
                    this.loadError = !category;
                    this.changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.category = null;
                    this.loadError = true;
                    this.changeDetectorRef.markForCheck();
                },
            });
    }

    goBack(): void {
        void this.router.navigate(['/categories']);
    }
}