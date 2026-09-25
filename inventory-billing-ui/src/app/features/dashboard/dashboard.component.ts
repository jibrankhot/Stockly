
import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  DashboardService,
  LowStockItem,
  StockStatuses
} from './dashboard.service';

interface DashboardKpi {
  title: string;
  value: number;
  prefix?: string;
  description: string;
  icon: string;
  highlighted?: boolean;
}

interface StockStatusView {
  label: string;
  value: number;
  percentage: number;
  type: 'in-stock' | 'low-stock' | 'out-of-stock';
}

interface RecentSale {
  id: number;
  invoiceNumber: string;
  customerId: number;
  customerName: string;
  invoiceDate: string;
  totalAmount: number;
  status: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [DatePipe, DecimalPipe, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  readonly currentDate = new Date();

  isLoading = true;
  hasError = false;

  kpis: DashboardKpi[] = [];
  stockStatuses: StockStatusView[] = [];
  totalProducts = 0;

  stockDonutBackground =
    'conic-gradient(#4fc77d 0% 0%, #9de6bd 0% 0%, #ef4444 0% 100%)';

  recentSales: RecentSale[] = [];
  lowStockItems: LowStockItem[] = [];

  ngOnInit(): void {
    this.loadDashboard();
  }

  private loadDashboard(): void {
    this.isLoading = true;
    this.hasError = false;

    this.dashboardService.getDashboardSummary().subscribe({
      next: response => {
        const { kpis, stockStatuses, recentSales, lowStockItems } = response;

        this.recentSales = recentSales;
        this.lowStockItems = lowStockItems;
        this.totalProducts = kpis.totalProducts;

        this.buildKpis(kpis);
        this.buildStockStatuses(stockStatuses);

        this.isLoading = false;
      },
      error: error => {
        console.error('Failed to load dashboard summary:', error);
        this.hasError = true;
        this.isLoading = false;
      }
    });
  }

  private buildKpis(data: {
    totalSales: number;
    totalPurchases: number;
    totalProducts: number;
    totalCustomers: number;
  }): void {
    this.kpis = [
      {
        title: 'Total Products',
        value: data.totalProducts,
        description: 'Active products in inventory',
        icon: '▣'
      },
      {
        title: 'Total Sales',
        value: data.totalSales,
        prefix: '₹',
        description: 'Total invoice sales',
        icon: '₹'
      },
      {
        title: 'Total Purchases',
        value: data.totalPurchases,
        prefix: '₹',
        description: 'Total purchase orders',
        icon: '▱'
      },
      {
        title: 'Total Customers',
        value: data.totalCustomers,
        description: 'Active customers',
        icon: '♙',
        highlighted: true
      }
    ];
  }

  private buildStockStatuses(data: StockStatuses): void {
    const total = this.totalProducts;

    this.stockStatuses = [
      {
        label: 'In Stock',
        value: data.inStock,
        percentage: this.calculatePercentage(data.inStock, total),
        type: 'in-stock'
      },
      {
        label: 'Low Stock',
        value: data.lowStock,
        percentage: this.calculatePercentage(data.lowStock, total),
        type: 'low-stock'
      },
      {
        label: 'Out of Stock',
        value: data.outOfStock,
        percentage: this.calculatePercentage(data.outOfStock, total),
        type: 'out-of-stock'
      }
    ];

    this.buildStockDonut(data);
  }

  private buildStockDonut(data: StockStatuses): void {
    const total = data.inStock + data.lowStock + data.outOfStock;

    if (total === 0) {
      this.stockDonutBackground = 'conic-gradient(#e2e8f0 0% 100%)';
      return;
    }

    const inStockEnd = (data.inStock / total) * 100;
    const lowStockEnd = inStockEnd + (data.lowStock / total) * 100;

    this.stockDonutBackground = `
      conic-gradient(
        #4fc77d 0% ${inStockEnd}%,
        #9de6bd ${inStockEnd}% ${lowStockEnd}%,
        #ef4444 ${lowStockEnd}% 100%
      )
    `;
  }

  private calculatePercentage(value: number, total: number): number {
    return total > 0 ? Math.round((value / total) * 100) : 0;
  }

  getStatusClass(status: string): string {
    return status.toLowerCase().replace(/\s+/g, '-');
  }

  getStockStatusClass(status: LowStockItem['status']): string {
    return status;
  }

  getStockStatusLabel(status: LowStockItem['status']): string {
    return status === 'out-of-stock' ? 'Out of Stock' : 'Low Stock';
  }

  getLowStockIcon(status: LowStockItem['status']): string {
    return status === 'out-of-stock' ? '▣' : '●';
  }

  retry(): void {
    this.loadDashboard();
  }
}