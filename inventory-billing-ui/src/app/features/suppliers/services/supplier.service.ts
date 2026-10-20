
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Supplier } from '../../../shared/models/supplier';
import { ApiClientService } from '../../../core/http/services/api-client.service';

export type CreateSupplierRequest = Pick<
    Supplier,
    | 'code'
    | 'name'
    | 'email'
    | 'phone'
    | 'address'
    | 'city'
    | 'state'
    | 'postalCode'
    | 'taxNumber'
    | 'isActive'
>;

export type UpdateSupplierRequest = Partial<CreateSupplierRequest>;

@Injectable({
    providedIn: 'root'
})
export class SupplierService {
    private readonly endpoint = 'suppliers';

    constructor(
        private readonly apiClient: ApiClientService
    ) { }

    getSuppliers(): Observable<Supplier[]> {
        return this.apiClient.get<Supplier[]>(this.endpoint);
    }

    getSupplierById(id: number): Observable<Supplier> {
        return this.apiClient.get<Supplier>(
            `${this.endpoint}/${id}`
        );
    }

    createSupplier(
        supplierData: CreateSupplierRequest
    ): Observable<Supplier> {
        return this.apiClient.post<Supplier>(
            this.endpoint,
            supplierData
        );
    }

    updateSupplier(
        id: number,
        supplierData: UpdateSupplierRequest
    ): Observable<Supplier> {
        return this.apiClient.put<Supplier>(
            `${this.endpoint}/${id}`,
            supplierData
        );
    }

    deleteSupplier(id: number): Observable<boolean> {
        return this.apiClient.delete<boolean>(
            `${this.endpoint}/${id}`
        );
    }
}
