import { DatePipe, DecimalPipe } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface DashboardStat {
  title: string;
  value: string;
  description: string;
  icon: string;
}

interface RecentInvoice {
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: 'Paid' | 'Pending' | 'Overdue';
  date: string;
}

interface LowStockProduct {
  name: string;
  sku: string;
  currentStock: number;
  minimumStock: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DecimalPipe,
    RouterLink,
    DatePipe
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {

  readonly currentDate = new Date();

  readonly stats: DashboardStat[] = [
    {
      title: 'Total Sales',
      value: '₹245,500',
      description: 'This month',
      icon: '₹'
    },
    {
      title: 'Total Purchases',
      value: '₹128,300',
      description: 'This month',
      icon: '▱'
    },
    {
      title: 'Products',
      value: '1,248',
      description: 'Active products',
      icon: '▣'
    },
    {
      title: 'Customers',
      value: '386',
      description: 'Active customers',
      icon: '♙'
    }
  ];

  readonly recentInvoices: RecentInvoice[] = [
    {
      invoiceNumber: 'INV-1001',
      customerName: 'ABC Traders',
      amount: 12500,
      status: 'Paid',
      date: '27 Aug 2026'
    },
    {
      invoiceNumber: 'INV-1002',
      customerName: 'City Mart',
      amount: 8750,
      status: 'Pending',
      date: '27 Aug 2026'
    },
    {
      invoiceNumber: 'INV-1003',
      customerName: 'Fresh Foods',
      amount: 15300,
      status: 'Paid',
      date: '26 Aug 2026'
    },
    {
      invoiceNumber: 'INV-1004',
      customerName: 'Global Stores',
      amount: 6200,
      status: 'Overdue',
      date: '25 Aug 2026'
    },
    {
      invoiceNumber: 'INV-1005',
      customerName: 'Metro Wholesale',
      amount: 19800,
      status: 'Paid',
      date: '24 Aug 2026'
    }
  ];

  readonly lowStockProducts: LowStockProduct[] = [
    {
      name: 'Wireless Keyboard',
      sku: 'KB-001',
      currentStock: 4,
      minimumStock: 10
    },
    {
      name: 'USB Type-C Cable',
      sku: 'CB-014',
      currentStock: 6,
      minimumStock: 15
    },
    {
      name: 'Bluetooth Mouse',
      sku: 'MS-008',
      currentStock: 3,
      minimumStock: 10
    },
    {
      name: 'HDMI Cable',
      sku: 'HD-021',
      currentStock: 7,
      minimumStock: 12
    }
  ];

  getStatusClass(status: RecentInvoice['status']): string {
    return status.toLowerCase();
  }

  getStockPercentage(product: LowStockProduct): number {
    if (product.minimumStock <= 0) {
      return 100;
    }

    const percentage =
      (product.currentStock / product.minimumStock) * 100;

    return Math.min(percentage, 100);
  }
}