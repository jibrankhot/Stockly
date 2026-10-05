import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    OnInit,
    inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import {
    ActivatedRoute,
    Router,
} from '@angular/router';
import { finalize } from 'rxjs';

import { Category } from '../../../../shared/models/category';
import { CategoryService } from '../../services/category.service';

@Component({
    selector: 'app-category-details',
    standalone: true,
    imports: [
        DatePipe,
    ],
    templateUrl: './category-details.component.html',
    styleUrl: './category-details.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetailsComponent
    implements OnInit {

    private readonly activatedRoute =
        inject(ActivatedRoute);

    private readonly categoryService =
        inject(CategoryService);

    private readonly router =
        inject(Router);

    private readonly changeDetectorRef =
        inject(ChangeDetectorRef);

    category: Category | null = null;
    isLoading = false;

    ngOnInit(): void {
        const categoryId = Number(
            this.activatedRoute.snapshot.paramMap.get('id')
        );

        if (
            !Number.isInteger(categoryId) ||
            categoryId <= 0
        ) {
            this.goBack();
            return;
        }

        this.loadCategory(categoryId);
    }

    loadCategory(id: number): void {
        this.isLoading = true;
        this.category = null;

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

    editCategory(): void {
        if (!this.category) {
            return;
        }

        void this.router.navigate([
            '/categories',
            this.category.id,
            'edit',
        ]);
    }

    goBack(): void {
        void this.router.navigate([
            '/categories',
        ]);
    }
}