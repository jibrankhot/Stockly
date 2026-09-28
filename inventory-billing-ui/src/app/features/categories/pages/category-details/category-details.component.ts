
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { Category } from '../../../../shared/models/category';
import { CategoryService } from '../../services/category.service';

@Component({
    selector: 'app-category-details',
    standalone: true,
    imports: [
        DatePipe
    ],
    templateUrl: './category-details.component.html',
    styleUrl: './category-details.component.scss'
})
export class CategoryDetailsComponent implements OnInit, OnDestroy {

    category: Category | null = null;
    isLoading = false;

    private readonly destroy$ = new Subject<void>();

    constructor(
        private readonly activatedRoute: ActivatedRoute,
        private readonly categoryService: CategoryService,
        private readonly router: Router
    ) { }

    ngOnInit(): void {
        this.activatedRoute.paramMap
            .pipe(takeUntil(this.destroy$))
            .subscribe(params => {
                const categoryId = Number(params.get('id'));

                if (!Number.isInteger(categoryId) || categoryId <= 0) {
                    this.category = null;
                    this.isLoading = false;
                    this.goBack();
                    return;
                }

                this.loadCategory(categoryId);
            });
    }

    loadCategory(id: number): void {
        this.isLoading = true;
        this.category = null;

        this.categoryService
            .getCategoryById(id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
                next: category => {
                    this.category = category;
                    this.isLoading = false;
                },
                error: error => {
                    console.error('Failed to load category:', error);
                    this.category = null;
                    this.isLoading = false;
                    // The HTTP error interceptor handles the error notification.
                }
            });
    }

    editCategory(): void {
        if (!this.category) {
            return;
        }

        this.router.navigate([
            '/categories',
            this.category.id,
            'edit'
        ]);
    }

    goBack(): void {
        this.router.navigate(['/categories']);
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}