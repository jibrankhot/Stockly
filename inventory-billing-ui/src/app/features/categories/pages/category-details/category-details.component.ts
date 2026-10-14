import {
    ChangeDetectionStrategy,
    ChangeDetectorRef,
    Component,
    DestroyRef,
    OnInit,
    inject,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import {
    catchError,
    distinctUntilChanged,
    finalize,
    map,
    of,
    switchMap,
    tap,
} from 'rxjs';

import { Category } from '../../../../shared/models/category';
import { CategoryService } from '../../services/category.service';

@Component({
    selector: 'app-category-details',
    standalone: true,
    imports: [DatePipe],
    templateUrl: './category-details.component.html',
    styleUrl: './category-details.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryDetailsComponent implements OnInit {
    private readonly activatedRoute = inject(ActivatedRoute);
    private readonly categoryService = inject(CategoryService);
    private readonly router = inject(Router);
    private readonly changeDetectorRef = inject(ChangeDetectorRef);
    private readonly destroyRef = inject(DestroyRef);

    category: Category | null = null;
    isLoading = false;
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

    retryLoad(): void {
        const categoryId = Number(
            this.activatedRoute.snapshot.paramMap.get('id'),
        );

        if (!Number.isInteger(categoryId) || categoryId <= 0) {
            void this.router.navigate(['/categories']);
            return;
        }

        this.loadError = false;
        this.isLoading = true;
        this.category = null;
        this.changeDetectorRef.markForCheck();

        this.categoryService
            .getCategoryById(categoryId)
            .pipe(
                finalize(() => {
                    this.isLoading = false;
                    this.changeDetectorRef.markForCheck();
                }),
                takeUntilDestroyed(this.destroyRef),
            )
            .subscribe({
                next: (category) => {
                    this.category = category;
                    this.loadError = false;
                    this.changeDetectorRef.markForCheck();
                },
                error: () => {
                    this.category = null;
                    this.loadError = true;
                    this.changeDetectorRef.markForCheck();
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
        void this.router.navigate(['/categories']);
    }
}