const express = require('express');
const router = express.Router();
const customersData = require('../data/customers.json');

// Get customer by ID
router.get('/customers/:id', (req, res) => {
    const { id } = req.params;

    const customer = customersData.customers.find(c => c.customerId === id);

    if (!customer) {
        return res.status(404).json({
            error: 'Customer not found',
            customerId: id
        });
    }

    // Simulate network delay
    setTimeout(() => {
        res.json(customer);
    }, 100);
});

// Search customers
router.get('/customers/search', (req, res) => {
    const { query } = req.query;

    if (!query) {
        return res.status(400).json({
            error: 'Query parameter is required'
        });
    }

    const results = customersData.customers.filter(customer => {
        const searchString = `${customer.firstName} ${customer.lastName} ${customer.email}`.toLowerCase();
        return searchString.includes(query.toLowerCase());
    });

    setTimeout(() => {
        res.json({
            query,
            count: results.length,
            results
        });
    }, 150);
});

// Get all customers (with pagination)
router.get('/customers', (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedCustomers = customersData.customers.slice(startIndex, endIndex);

    res.json({
        page: parseInt(page),
        limit: parseInt(limit),
        total: customersData.customers.length,
        customers: paginatedCustomers
    });
});

module.exports = router;