
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Category } from '../../../../shared/models/category';
import { CategoryService } from '../../services/category.service';
import { CategoryFormComponent } from '../../category-form/category-form.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
    selector: 'app-category-create',
    standalone: true,
    imports: [
        CategoryFormComponent
    ],
    templateUrl: './category-create.component.html',
    styleUrl: './category-create.component.scss'
})
export class CategoryCreateComponent {

    isSubmitting = false;

    constructor(
        private readonly categoryService: CategoryService,
        private readonly router: Router,
        private readonly notificationService: NotificationService
    ) { }

    onSubmit(categoryData: Partial<Category>): void {
        if (this.isSubmitting) {
            return;
        }

        this.isSubmitting = true;

        this.categoryService
            .createCategory(categoryData)
            .pipe(
                finalize(() => {
                    this.isSubmitting = false;
                })
            )
            .subscribe({
                next: category => {
                    this.notificationService.success(
                        `Category "${category.name}" created successfully.`
                    );

                    this.router.navigate(['/categories']);
                },
                error: error => {
                    console.error('Failed to create category:', error);
                    // The HTTP error interceptor handles the error notification.
                }
            });
    }

    onCancel(): void {
        if (this.isSubmitting) {
            return;
        }

        this.router.navigate(['/categories']);
    }
}