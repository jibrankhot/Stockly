import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { ApiResponse } from '../../../core/models/api-response';
import { ApiClientService } from '../../../core/http/services/api-client.service';

import {
    Product,
} from '../../../shared/models/product';

@Injectable({
    providedIn: 'root',
})
export class ProductService {

    private readonly endpoint = 'products';

    constructor(
        private readonly apiClient: ApiClientService
    ) { }

    getProducts(): Observable<Product[]> {
        return this.apiClient
            .get<ApiResponse<Product[]>>(
                this.endpoint
            )
            .pipe(
                map((response) => response.data)
            );
    }

    getProductById(
        id: number
    ): Observable<Product> {
        return this.apiClient
            .get<ApiResponse<Product>>(
                `${this.endpoint}/${id}`
            )
            .pipe(
                map((response) => response.data)
            );
    }

    createProduct(
        productData: Partial<Product>
    ): Observable<Product> {
        return this.apiClient
            .post<ApiResponse<Product>>(
                this.endpoint,
                productData
            )
            .pipe(
                map((response) => response.data)
            );
    }

    updateProduct(
        id: number,
        productData: Partial<Product>
    ): Observable<Product> {
        return this.apiClient
            .put<ApiResponse<Product>>(
                `${this.endpoint}/${id}`,
                productData
            )
            .pipe(
                map((response) => response.data)
            );
    }

    deleteProduct(
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