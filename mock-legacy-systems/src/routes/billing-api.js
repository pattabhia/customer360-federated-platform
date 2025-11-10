const express = require('express');
const router = express.Router();
const billingData = require('../data/invoices.json');

// Get invoices by customer ID
router.get('/invoices', (req, res) => {
    const { customerId, status } = req.query;

    if (!customerId) {
        return res.status(400).json({
            error: 'customerId query parameter is required'
        });
    }

    let invoices = billingData.invoices.filter(invoice => invoice.customerId === customerId);

    // Filter by status if provided
    if (status) {
        invoices = invoices.filter(invoice => invoice.status === status.toUpperCase());
    }

    // Simulate network delay
    setTimeout(() => {
        res.json({
            customerId,
            count: invoices.length,
            invoices
        });
    }, 130);
});

// Get single invoice by ID
router.get('/invoices/:invoiceId', (req, res) => {
    const { invoiceId } = req.params;

    const invoice = billingData.invoices.find(inv => inv.invoiceId === invoiceId);

    if (!invoice) {
        return res.status(404).json({
            error: 'Invoice not found',
            invoiceId
        });
    }

    setTimeout(() => {
        res.json(invoice);
    }, 100);
});

// Get payments for a customer
router.get('/payments', (req, res) => {
    const { customerId } = req.query;

    if (!customerId) {
        return res.status(400).json({
            error: 'customerId query parameter is required'
        });
    }

    const customerInvoices = billingData.invoices.filter(inv => inv.customerId === customerId);

    // Extract all payments from invoices
    const payments = [];
    customerInvoices.forEach(invoice => {
        invoice.paymentHistory.forEach(payment => {
            payments.push({
                ...payment,
                invoiceId: invoice.invoiceId,
                invoiceNumber: invoice.invoiceNumber
            });
        });
    });

    setTimeout(() => {
        res.json({
            customerId,
            count: payments.length,
            payments
        });
    }, 110);
});

// Get billing summary for a customer
router.get('/billing/summary/:customerId', (req, res) => {
    const { customerId } = req.params;

    const customerBillingInfo = billingData.customerBilling[customerId];
    const customerInvoices = billingData.invoices.filter(inv => inv.customerId === customerId);

    if (!customerBillingInfo) {
        return res.status(404).json({
            error: 'Customer billing information not found',
            customerId
        });
    }

    const summary = {
        customerId,
        ...customerBillingInfo,
        invoiceStats: {
            total: customerInvoices.length,
            paid: customerInvoices.filter(inv => inv.status === 'PAID').length,
            pending: customerInvoices.filter(inv => inv.status === 'PENDING').length,
            overdue: customerInvoices.filter(inv => inv.status === 'OVERDUE').length
        },
        totalInvoiceAmount: customerInvoices.reduce((sum, inv) => sum + inv.amount, 0),
        totalPaidAmount: customerInvoices.reduce((sum, inv) => sum + inv.amountPaid, 0)
    };

    res.json(summary);
});

module.exports = router;