import {
  DatePipe,
  DecimalPipe
} from '@angular/common';

import {
  Component,
  OnInit,
  inject
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

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


@Component({
  selector: 'app-dashboard',
  standalone: true,

  imports: [
    DatePipe,
    DecimalPipe,
    RouterLink
  ],

  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {

  private readonly dashboardService =
    inject(DashboardService);


  /* =======================================================
     PAGE STATE
     ======================================================= */

  readonly currentDate = new Date();

  isLoading = true;

  hasError = false;


  /* =======================================================
     KPI DATA
     ======================================================= */

  kpis: DashboardKpi[] = [];


  /* =======================================================
     STOCK STATUS
     ======================================================= */

  stockStatuses: StockStatusView[] = [];

  totalProducts = 0;

  stockDonutBackground =
    'conic-gradient(#4fc77d 0% 0%, #9de6bd 0% 0%, #ef4444 0% 100%)';


  /* =======================================================
     RECENT SALES
     ======================================================= */

  recentSales = [] as {
    id: number;
    invoiceNumber: string;
    customerId: number;
    customerName: string;
    invoiceDate: string;
    totalAmount: number;
    status: string;
  }[];


  /* =======================================================
     LOW STOCK
     ======================================================= */

  lowStockItems: LowStockItem[] = [];


  /* =======================================================
     LIFECYCLE
     ======================================================= */

  ngOnInit(): void {
    this.loadDashboard();
  }


  /* =======================================================
     LOAD DASHBOARD
     ======================================================= */

  private loadDashboard(): void {

    this.isLoading = true;

    this.hasError = false;


    this.dashboardService
      .getDashboardSummary()
      .subscribe({

        next: response => {

          this.recentSales =
            response.recentSales;

          this.lowStockItems =
            response.lowStockItems;

          this.totalProducts =
            response.kpis.totalProducts;


          this.buildKpis(
            response.kpis
          );

          this.buildStockStatuses(
            response.stockStatuses
          );


          this.isLoading = false;
        },


        error: error => {

          console.error(
            'Failed to load dashboard summary:',
            error
          );

          this.hasError = true;

          this.isLoading = false;
        }

      });
  }


  /* =======================================================
     KPI MAPPING
     ======================================================= */

  private buildKpis(
    kpis: {
      totalSales: number;
      totalPurchases: number;
      totalProducts: number;
      totalCustomers: number;
    }
  ): void {

    this.kpis = [

      {
        title: 'Total Products',

        value: kpis.totalProducts,

        description:
          'Active products in inventory',

        icon: '▣',

        highlighted: false
      },


      {
        title: 'Total Sales',

        value: kpis.totalSales,

        prefix: '₹',

        description:
          'Total invoice sales',

        icon: '₹',

        highlighted: false
      },


      {
        title: 'Total Purchases',

        value: kpis.totalPurchases,

        prefix: '₹',

        description:
          'Total purchase orders',

        icon: '▱',

        highlighted: false
      },


      {
        title: 'Total Customers',

        value: kpis.totalCustomers,

        description:
          'Active customers',

        icon: '♙',

        highlighted: true
      }

    ];
  }


  /* =======================================================
     STOCK STATUS MAPPING
     ======================================================= */

  private buildStockStatuses(
    stockStatuses: StockStatuses
  ): void {

    const total =
      this.totalProducts;


    this.stockStatuses = [

      {
        label: 'In Stock',

        value:
          stockStatuses.inStock,

        percentage:
          this.calculatePercentage(
            stockStatuses.inStock,
            total
          ),

        type: 'in-stock'
      },


      {
        label: 'Low Stock',

        value:
          stockStatuses.lowStock,

        percentage:
          this.calculatePercentage(
            stockStatuses.lowStock,
            total
          ),

        type: 'low-stock'
      },


      {
        label: 'Out of Stock',

        value:
          stockStatuses.outOfStock,

        percentage:
          this.calculatePercentage(
            stockStatuses.outOfStock,
            total
          ),

        type: 'out-of-stock'
      }

    ];


    this.buildStockDonut(
      stockStatuses
    );
  }


  /* =======================================================
     STOCK DONUT
     ======================================================= */

  private buildStockDonut(
    stockStatuses: StockStatuses
  ): void {

    const total =
      stockStatuses.inStock +
      stockStatuses.lowStock +
      stockStatuses.outOfStock;


    if (total <= 0) {

      this.stockDonutBackground =
        'conic-gradient(#e2e8f0 0% 100%)';

      return;
    }


    const inStockPercentage =
      (stockStatuses.inStock / total) * 100;


    const lowStockPercentage =
      (stockStatuses.lowStock / total) * 100;


    const lowStockEnd =
      inStockPercentage +
      lowStockPercentage;


    this.stockDonutBackground = `
      conic-gradient(
        #4fc77d 0% ${inStockPercentage}%,
        #9de6bd ${inStockPercentage}% ${lowStockEnd}%,
        #ef4444 ${lowStockEnd}% 100%
      )
    `;
  }


  /* =======================================================
     HELPERS
     ======================================================= */

  private calculatePercentage(
    value: number,
    total: number
  ): number {

    if (total <= 0) {
      return 0;
    }


    return Math.round(
      (value / total) * 100
    );
  }


  getStatusClass(
    status: string
  ): string {

    return status
      .toLowerCase()
      .replace(/\s+/g, '-');
  }


  getStockStatusClass(
    status: LowStockItem['status']
  ): string {

    return status;
  }


  getStockStatusLabel(
    status: LowStockItem['status']
  ): string {

    return status === 'out-of-stock'
      ? 'Out of Stock'
      : 'Low Stock';
  }


  getLowStockIcon(
    status: LowStockItem['status']
  ): string {

    return status === 'out-of-stock'
      ? '▣'
      : '●';
  }


  /* =======================================================
     RETRY
     ======================================================= */

  retry(): void {
    this.loadDashboard();
  }
}