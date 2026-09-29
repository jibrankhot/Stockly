
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Supplier } from '../../../shared/models/supplier';
import { ApiClientService } from '../../../core/http/services/api-client.service';

@Injectable({
    providedIn: 'root'
})
export class SupplierService {

    private readonly endpoint = 'suppliers';

    constructor(
        private readonly apiClient: ApiClientService
    ) { }

    getSuppliers(): Observable<Supplier[]> {
        return this.apiClient.get<Supplier[]>(
            this.endpoint
        );
    }

    getSupplierById(
        id: number
    ): Observable<Supplier> {
        return this.apiClient.get<Supplier>(
            `${this.endpoint}/${id}`
        );
    }

    createSupplier(
        supplierData: Partial<Supplier>
    ): Observable<Supplier> {
        return this.apiClient.post<Supplier>(
            this.endpoint,
            supplierData
        );
    }

    updateSupplier(
        id: number,
        supplierData: Partial<Supplier>
    ): Observable<Supplier> {
        return this.apiClient.put<Supplier>(
            `${this.endpoint}/${id}`,
            supplierData
        );
    }

    deleteSupplier(
        id: number
    ): Observable<boolean> {
        return this.apiClient.delete<boolean>(
            `${this.endpoint}/${id}`
        );
    }
}