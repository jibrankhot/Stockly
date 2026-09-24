import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiClientService } from '../../core/http/services/api-client.service';


export interface DashboardKpis {
    totalSales: number;
    totalPurchases: number;
    totalProducts: number;
    totalCustomers: number;
}

export interface SalesPurchaseData {
    month: string;
    year: number;
    sales: number;
    purchases: number;
}

export interface StockStatuses {
    inStock: number;
    lowStock: number;
    outOfStock: number;
}

export interface RecentSale {
    id: number;
    invoiceNumber: string;
    customerId: number;
    customerName: string;
    invoiceDate: string;
    totalAmount: number;
    status: string;
}

export interface LowStockItem {
    id: number;
    sku: string;
    name: string;
    unit: string;
    currentStock: number;
    minimumStock: number;
    status: 'low-stock' | 'out-of-stock';
}

export interface DashboardSummary {
    kpis: DashboardKpis;
    salesPurchases: SalesPurchaseData[];
    stockStatuses: StockStatuses;
    recentSales: RecentSale[];
    lowStockItems: LowStockItem[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly apiClient = inject(ApiClientService);

    getDashboardSummary(): Observable<DashboardSummary> {
        return this.apiClient.get<DashboardSummary>(
            '/dashboard/summary'
        );
    }
}