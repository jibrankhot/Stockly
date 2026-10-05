import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { CreateCategoryRequest } from '../../../../shared/models/category';
import { CategoryService } from '../../services/category.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { CategoryFormComponent } from '../../category-form/category-form.component';

@Component({
    selector: 'app-category-create',
    standalone: true,
    imports: [
        CategoryFormComponent,
    ],
    templateUrl: './category-create.component.html',
    styleUrl: './category-create.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryCreateComponent {
    private readonly categoryService =
        inject(CategoryService);

    private readonly router =
        inject(Router);

    private readonly notificationService =
        inject(NotificationService);

    private readonly changeDetectorRef =
        inject(ChangeDetectorRef);

    isSubmitting = false;

    onSubmit(
        categoryData: CreateCategoryRequest
    ): void {
        if (this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;

        this.categoryService
            .createCategory(categoryData)
            .pipe(
                finalize(() => {
                    this.isSubmitting = false;
                    this.changeDetectorRef.markForCheck();
                })
            )
            .subscribe({
                next: (category) => {
                    this.notificationService.success(
                        `Category "${category.name}" created successfully.`
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
        if (this.isSubmitting) {
            return;
        }

        void this.router.navigate([
            '/categories',
        ]);
    }
}