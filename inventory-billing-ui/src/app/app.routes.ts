import { Routes } from '@angular/router';

import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard } from './core/auth/guards/auth.guard';

export const routes: Routes = [
    // Default route
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
    },

    // Authentication
    {
        path: 'auth',
        component: AuthLayoutComponent,
        children: [
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full',
            },
            {
                path: 'login',
                loadComponent: () =>
                    import('./features/auth/login/login.component').then(
                        (m) => m.LoginComponent,
                    ),
            },
            {
                path: 'forgot-password',
                loadComponent: () =>
                    import(
                        './features/auth/forgot-password/forgot-password.component'
                    ).then((m) => m.ForgotPasswordComponent),
            },
            {
                path: 'reset-password',
                loadComponent: () =>
                    import(
                        './features/auth/reset-password/reset-password.component'
                    ).then(
                        m => m.ResetPasswordComponent
                    )
            },
        ],
    },

    // Main application
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            // Dashboard
            {
                path: 'dashboard',
                canActivate: [authGuard],
                loadComponent: () =>
                    import('./features/dashboard/dashboard.component').then(
                        (m) => m.DashboardComponent,
                    ),
            },

            // Products
            {
                path: 'products',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/products/pages/product-list/product-list.component'
                            ).then((m) => m.ProductListComponent),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/products/pages/product-create/product-create.component'
                            ).then((m) => m.ProductCreateComponent),
                    },
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/products/pages/product-edit/product-edit.component'
                            ).then((m) => m.ProductEditComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/products/pages/product-details/product-details.component'
                            ).then((m) => m.ProductDetailsComponent),
                    },
                ],
            },

            // Categories
            {
                path: 'categories',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/categories/pages/category-list/category-list.component'
                            ).then((m) => m.CategoryListComponent),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/categories/pages/category-create/category-create.component'
                            ).then((m) => m.CategoryCreateComponent),
                    },
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/categories/pages/category-edit/category-edit.component'
                            ).then((m) => m.CategoryEditComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/categories/pages/category-details/category-details.component'
                            ).then((m) => m.CategoryDetailsComponent),
                    },
                ],
            },

            // Suppliers
            {
                path: 'suppliers',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/suppliers/pages/supplier-list/supplier-list.component'
                            ).then((m) => m.SupplierListComponent),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/suppliers/pages/supplier-create/supplier-create.component'
                            ).then((m) => m.SupplierCreateComponent),
                    },
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/suppliers/pages/supplier-edit/supplier-edit.component'
                            ).then((m) => m.SupplierEditComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/suppliers/pages/supplier-details/supplier-details.component'
                            ).then((m) => m.SupplierDetailsComponent),
                    },
                ],
            },

            // Customers
            {
                path: 'customers',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/customers/pages/customer-list/customer-list.component'
                            ).then((m) => m.CustomerListComponent),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/customers/pages/customer-create/customer-create.component'
                            ).then((m) => m.CustomerCreateComponent),
                    },
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/customers/pages/customer-edit/customer-edit.component'
                            ).then((m) => m.CustomerEditComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/customers/pages/customer-details/customer-details.component'
                            ).then((m) => m.CustomerDetailsComponent),
                    },
                ],
            },

            // Invoices
            {
                path: 'invoices',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/sales/invoices/pages/invoice-list/invoice-list.component'
                            ).then((m) => m.InvoiceListComponent),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/sales/invoices/pages/invoice-create/invoice-create.component'
                            ).then((m) => m.InvoiceCreateComponent),
                    },
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/sales/invoices/pages/invoice-edit/invoice-edit.component'
                            ).then((m) => m.InvoiceEditComponent),
                    },
                    {
                        path: ':id/print',
                        loadComponent: () =>
                            import(
                                './features/sales/invoices/pages/invoice-print/invoice-print.component'
                            ).then((m) => m.InvoicePrintComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/sales/invoices/pages/invoice-details/invoice-details.component'
                            ).then((m) => m.InvoiceDetailsComponent),
                    },
                ],
            },

            // Purchase Orders
            {
                path: 'purchases',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/purchases/pages/purchase-order-list/purchase-order-list.component'
                            ).then((m) => m.PurchaseOrderListComponent),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/purchases/pages/purchase-order-create/purchase-order-create.component'
                            ).then((m) => m.PurchaseOrderCreateComponent),
                    },
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/purchases/pages/purchase-order-edit/purchase-order-edit.component'
                            ).then((m) => m.PurchaseOrderEditComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/purchases/pages/purchase-order-details/purchase-order-details.component'
                            ).then((m) => m.PurchaseOrderDetailsComponent),
                    },
                ],
            },

            // Inventory
            {
                path: 'inventory',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/inventory/pages/stock-overview/stock-overview.component'
                            ).then((m) => m.StockOverviewComponent),
                    },
                    {
                        path: 'low-stock',
                        loadComponent: () =>
                            import(
                                './features/inventory/pages/low-stock/low-stock.component'
                            ).then((m) => m.LowStockComponent),
                    },
                    {
                        path: 'movements',
                        loadComponent: () =>
                            import(
                                './features/inventory/pages/stock-movement/stock-movements.component'
                            ).then((m) => m.StockMovementsComponent),
                    },
                    {
                        path: 'adjustment',
                        loadComponent: () =>
                            import(
                                './features/inventory/pages/stock-adjustment/stock-adjustment.component'
                            ).then((m) => m.StockAdjustmentComponent),
                    },
                ],
            },

            // Sales Orders
            {
                path: 'sales-orders',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-orders/pages/sales-order-list/sales-order-list.component'
                            ).then((m) => m.SalesOrderListComponent),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-orders/pages/sales-order-create/sales-order-create.component'
                            ).then((m) => m.SalesOrderCreateComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-orders/pages/sales-order-details/sales-order-details.component'
                            ).then((m) => m.SalesOrderDetailsComponent),
                    },
                ],
            },

            // Sales Returns
            {
                path: 'sales-returns',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-returns/pages/sales-return-list/sales-return-list.component'
                            ).then((m) => m.SalesReturnListComponent),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-returns/pages/sales-return-create/sales-return-create.component'
                            ).then((m) => m.SalesReturnCreateComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/sales/sales-returns/pages/sales-return-details/sales-return-details.component'
                            ).then((m) => m.SalesReturnDetailsComponent),
                    },
                ],
            },

            // Payments
            {
                path: 'payments',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/payments/pages/payment-list/payment-list.component'
                            ).then((m) => m.PaymentListComponent),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/payments/pages/payment-create/payment-create.component'
                            ).then((m) => m.PaymentCreateComponent),
                    },
                    {
                        path: ':id',
                        loadComponent: () =>
                            import(
                                './features/payments/pages/payment-details/payment-details.component'
                            ).then((m) => m.PaymentDetailsComponent),
                    },
                ],
            },

            // Reports
            {
                path: 'reports',
                canActivate: [authGuard],
                children: [
                    {
                        path: 'sales',
                        loadComponent: () =>
                            import(
                                './features/reports/sales-report/sales-report.component'
                            ).then((m) => m.SalesReportComponent),
                    },
                    {
                        path: 'purchases',
                        loadComponent: () =>
                            import(
                                './features/reports/purchase-report/purchase-report.component'
                            ).then((m) => m.PurchaseReportComponent),
                    },
                    {
                        path: 'inventory',
                        loadComponent: () =>
                            import(
                                './features/reports/inventory-report/inventory-report.component'
                            ).then((m) => m.InventoryReportComponent),
                    },
                    {
                        path: 'payments',
                        loadComponent: () =>
                            import(
                                './features/reports/payment-report/payment-report.component'
                            ).then((m) => m.PaymentReportComponent),
                    },
                ],
            },

            // Users
            {
                path: 'users',
                canActivate: [authGuard],
                children: [
                    {
                        path: '',
                        loadComponent: () =>
                            import(
                                './features/users/pages/user-list/user-list.component'
                            ).then((m) => m.UserListComponent),
                    },
                    {
                        path: 'create',
                        loadComponent: () =>
                            import(
                                './features/users/pages/user-form/user-form.component'
                            ).then((m) => m.UserFormComponent),
                    },
                    {
                        path: ':id/edit',
                        loadComponent: () =>
                            import(
                                './features/users/pages/user-form/user-form.component'
                            ).then((m) => m.UserFormComponent),
                    },
                    {
                        path: 'roles',
                        loadComponent: () =>
                            import(
                                './features/users/pages/role-list/role-list.component'
                            ).then((m) => m.RoleListComponent),
                    },
                ],
            },

            // Settings
            {
                path: 'settings',
                canActivate: [authGuard],
                children: [
                    {
                        path: 'company',
                        loadComponent: () =>
                            import(
                                './features/settings/pages/company-profile/company-profile.component'
                            ).then((m) => m.CompanyProfileComponent),
                    },
                    {
                        path: 'invoice',
                        loadComponent: () =>
                            import(
                                './features/settings/pages/invoice-settings/invoice-settings.component'
                            ).then((m) => m.InvoiceSettingsComponent),
                    },
                    {
                        path: 'tax',
                        loadComponent: () =>
                            import(
                                './features/settings/pages/tax-settings/tax-settings.component'
                            ).then((m) => m.TaxSettingsComponent),
                    },
                ],
            },
        ],
    },

    // Unknown routes
    {
        path: '**',
        redirectTo: 'dashboard',
    },
];