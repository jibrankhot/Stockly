import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response';
import { ApiClientService } from '../../../core/http/services/api-client.service';

import {
    Category,
    CreateCategoryRequest,
    UpdateCategoryRequest,
} from '../../../shared/models/category';

@Injectable({
    providedIn: 'root',
})
export class CategoryService {
    private readonly endpoint = 'categories';

    constructor(
        private readonly apiClient: ApiClientService
    ) { }

    getCategories(): Observable<Category[]> {
        return this.apiClient
            .get<ApiResponse<Category[]>>(
                this.endpoint
            )
            .pipe(
                map((response) => response.data)
            );
    }

    getCategoryById(
        id: number
    ): Observable<Category> {
        return this.apiClient
            .get<ApiResponse<Category>>(
                `${this.endpoint}/${id}`
            )
            .pipe(
                map((response) => response.data)
            );
    }

    createCategory(
        categoryData: CreateCategoryRequest
    ): Observable<Category> {
        return this.apiClient
            .post<ApiResponse<Category>>(
                this.endpoint,
                categoryData
            )
            .pipe(
                map((response) => response.data)
            );
    }

    updateCategory(
        id: number,
        categoryData: UpdateCategoryRequest
    ): Observable<Category> {
        return this.apiClient
            .put<ApiResponse<Category>>(
                `${this.endpoint}/${id}`,
                categoryData
            )
            .pipe(
                map((response) => response.data)
            );
    }

    deleteCategory(
        id: number
    ): Observable<null> {
        return this.apiClient
            .delete<ApiResponse<null>>(
                `${this.endpoint}/${id}`
            )
            .pipe(
                map((response) => response.data)
            );
    }
}