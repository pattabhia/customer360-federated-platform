const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const crmRoutes = require('./routes/crm-api');
const orderRoutes = require('./routes/order-api');
const billingRoutes = require('./routes/billing-api');
const supportRoutes = require('./routes/support-api');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        services: {
            crm: 'operational',
            orders: 'operational',
            billing: 'operational',
            support: 'operational'
        }
    });
});

// Routes
app.use('/api', crmRoutes);
app.use('/api', orderRoutes);
app.use('/api', billingRoutes);
app.use('/api', supportRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Mock Legacy Systems API',
        version: '1.0.0',
        endpoints: {
            crm: {
                getCustomer: 'GET /api/customers/:id',
                searchCustomers: 'GET /api/customers/search?query=:query'
            },
            orders: {
                getOrders: 'GET /api/orders?customerId=:customerId',
                getOrder: 'GET /api/orders/:orderId'
            },
            billing: {
                getInvoices: 'GET /api/invoices?customerId=:customerId',
                getPayments: 'GET /api/payments?customerId=:customerId'
            },
            support: {
                getTickets: 'GET /api/tickets?customerId=:customerId',
                getTicket: 'GET /api/tickets/:ticketId'
            }
        }
    });
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Cannot ${req.method} ${req.path}`
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Mock Legacy Systems API running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`📁 Available APIs:`);
    console.log(`   - CRM (SAP):           http://localhost:${PORT}/api/customers/:id`);
    console.log(`   - Order Management:    http://localhost:${PORT}/api/orders?customerId=:id`);
    console.log(`   - Billing (Zuora):     http://localhost:${PORT}/api/invoices?customerId=:id`);
    console.log(`   - Support (ServiceNow): http://localhost:${PORT}/api/tickets?customerId=:id`);
});

module.exports = app;