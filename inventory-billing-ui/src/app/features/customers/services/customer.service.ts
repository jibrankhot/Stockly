import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Customer } from '../../../shared/models/customer';
import { ApiClientService } from '../../../core/http/services/api-client.service';

@Injectable({
    providedIn: 'root'
})
export class CustomerService {

    private readonly endpoint = 'customers';

    constructor(
        private readonly apiClient: ApiClientService
    ) { }

    getCustomers(): Observable<Customer[]> {
        return this.apiClient.get<Customer[]>(
            this.endpoint
        );
    }

    getCustomerById(
        id: number
    ): Observable<Customer> {
        return this.apiClient.get<Customer>(
            `${this.endpoint}/${id}`
        );
    }

    createCustomer(
        customerData: Partial<Customer>
    ): Observable<Customer> {
        return this.apiClient.post<Customer>(
            this.endpoint,
            customerData
        );
    }

    updateCustomer(
        id: number,
        customerData: Partial<Customer>
    ): Observable<Customer> {
        return this.apiClient.put<Customer>(
            `${this.endpoint}/${id}`,
            customerData
        );
    }

    deleteCustomer(
        id: number
    ): Observable<boolean> {
        return this.apiClient.delete<boolean>(
            `${this.endpoint}/${id}`
        );
    }
}