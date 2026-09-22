export interface SidebarItem {
    label: string;
    icon: string;
    route?: string;
    children?: SidebarItem[];
}

export const SIDEBAR_ITEMS: SidebarItem[] = [
    {
        label: 'Dashboard',
        icon: '▦',
        route: '/dashboard'
    },

    {
        label: 'Products',
        icon: '▣',
        children: [
            {
                label: 'Products',
                icon: '•',
                route: '/products'
            },
            {
                label: 'Categories',
                icon: '•',
                route: '/categories'
            }
        ]
    },

    {
        label: 'Customers',
        icon: '♙',
        route: '/customers'
    },

    {
        label: 'Suppliers',
        icon: '♧',
        route: '/suppliers'
    },

    {
        label: 'Inventory',
        icon: '▤',
        children: [
            {
                label: 'Stock Overview',
                icon: '•',
                route: '/inventory'
            },
            {
                label: 'Stock Movements',
                icon: '•',
                route: '/inventory/movements'
            },
            {
                label: 'Stock Adjustment',
                icon: '•',
                route: '/inventory/adjustment'
            },
            {
                label: 'Low Stock',
                icon: '•',
                route: '/inventory/low-stock'
            }
        ]
    },

    {
        label: 'Sales',
        icon: '▰',
        children: [
            {
                label: 'Invoices',
                icon: '•',
                route: '/invoices'
            },
            {
                label: 'Sales Orders',
                icon: '•',
                route: '/sales-orders'
            },
            {
                label: 'Sales Returns',
                icon: '•',
                route: '/sales-returns'
            }
        ]
    },

    {
        label: 'Purchases',
        icon: '▱',
        children: [
            {
                label: 'Purchase Orders',
                icon: '•',
                route: '/purchases'
            }
        ]
    },

    {
        label: 'Payments',
        icon: '₹',
        route: '/payments'
    },

    {
        label: 'Reports',
        icon: '▥',
        children: [
            {
                label: 'Sales Report',
                icon: '•',
                route: '/reports/sales'
            },
            {
                label: 'Purchase Report',
                icon: '•',
                route: '/reports/purchases'
            },
            {
                label: 'Inventory Report',
                icon: '•',
                route: '/reports/inventory'
            },
            {
                label: 'Payment Report',
                icon: '•',
                route: '/reports/payments'
            }
        ]
    },

    {
        label: 'Users',
        icon: '♙',
        children: [
            {
                label: 'Users',
                icon: '•',
                route: '/users'
            },
            {
                label: 'Roles',
                icon: '•',
                route: '/users/roles'
            }
        ]
    },

    {
        label: 'Settings',
        icon: '⚙',
        children: [
            {
                label: 'Company Profile',
                icon: '•',
                route: '/settings/company'
            },
            {
                label: 'Invoice Settings',
                icon: '•',
                route: '/settings/invoice'
            },
            {
                label: 'Tax Settings',
                icon: '•',
                route: '/settings/tax'
            }
        ]
    }
];