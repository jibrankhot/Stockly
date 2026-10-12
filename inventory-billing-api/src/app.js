
'use strict';

const express = require('express');
const cors = require('cors');

const { corsOrigin } = require('./config/env');

const authRoutes = require('./routes/auth.routes');
const invoiceRoutes = require('./routes/invoice.routes');
const categoryRoutes = require('./routes/category.routes');
const productRoutes = require('./routes/product.routes');
const customerRoutes = require('./routes/customer.routes');
const supplierRoutes = require('./routes/supplier.routes');
const purchaseOrderRoutes = require('./routes/purchase-order.routes');
const salesOrderRoutes = require('./routes/sales-order.routes');
const paymentRoutes = require('./routes/payment.routes');
const salesReturnRoutes = require('./routes/sales-return.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const inventoryRoutes = require('./routes/inventory.routes');
const reportRoutes = require('./routes/report.routes');
const userRoutes = require('./routes/user.routes');
const settingsRoutes = require('./routes/settings.routes');

const errorMiddleware = require('./middleware/error.middleware');

const app = express();

app.disable('x-powered-by');

app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  }),
);

app.use(
  express.json({
    limit: '1mb',
  }),
);

app.use(
  express.urlencoded({
    extended: true,
    limit: '1mb',
    parameterLimit: 1000,
  }),
);

// Liveness endpoint: confirms that the API process is responding.
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Stockly API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchases', purchaseOrderRoutes);
app.use('/api/sales-orders', salesOrderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/sales-returns', salesReturnRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);

// Handle requests that do not match a route.
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
  });
});

// Keep the error handler last so errors from routes and middleware
// are handled consistently.
app.use(errorMiddleware);

module.exports = app;
