import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    inject,
} from '@angular/core';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';
import { finalize } from 'rxjs';

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
    imports: [
        CategoryFormComponent,
    ],
    templateUrl: './category-edit.component.html',
    styleUrl: './category-edit.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryEditComponent implements OnInit {
    private readonly activatedRoute =
        inject(ActivatedRoute);

    private readonly categoryService =
        inject(CategoryService);

    private readonly router =
        inject(Router);

    private readonly notificationService =
        inject(NotificationService);

    private readonly changeDetectorRef =
        inject(ChangeDetectorRef);

    category: Category | null = null;

    isLoading = false;
    isSubmitting = false;

    ngOnInit(): void {
        const categoryId = Number(
            this.activatedRoute.snapshot.paramMap.get('id')
        );

        if (
            !Number.isInteger(categoryId) ||
            categoryId <= 0
        ) {
            this.notificationService.error(
                'Invalid category ID.'
            );

            this.goBack();
            return;
        }

        this.loadCategory(categoryId);
    }

    loadCategory(id: number): void {
        this.isLoading = true;

        this.categoryService
            .getCategoryById(id)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    this.changeDetectorRef.markForCheck();
                })
            )
            .subscribe({
                next: (category) => {
                    this.category = category;
                    this.changeDetectorRef.markForCheck();
                },

                error: () => {
                    this.category = null;
                },
            });
    }

    onSubmit(
        categoryData: UpdateCategoryRequest
    ): void {
        if (
            !this.category ||
            this.isSubmitting
        ) {
            return;
        }

        this.isSubmitting = true;

        this.categoryService
            .updateCategory(
                this.category.id,
                categoryData
            )
            .pipe(
                finalize(() => {
                    this.isSubmitting = false;
                    this.changeDetectorRef.markForCheck();
                })
            )
            .subscribe({
                next: (updatedCategory) => {
                    this.notificationService.success(
                        `Category "${updatedCategory.name}" updated successfully.`
                    );

                    void this.router.navigate([
                        '/categories',
                    ]);
                },

                error: () => {
                    // The HTTP error interceptor handles
                    // the error notification.
                },
            });
    }

    onCancel(): void {
        if (!this.category) {
            this.goBack();
            return;
        }

        void this.router.navigate([
            '/categories',
            this.category.id,
        ]);
    }

    goBack(): void {
        void this.router.navigate([
            '/categories',
        ]);
    }
}