const express = require('express');
const router = express.Router();
const ordersData = require('../data/orders.json');

// Get orders by customer ID
router.get('/orders', (req, res) => {
    const { customerId, status, limit = 10 } = req.query;

    if (!customerId) {
        return res.status(400).json({
            error: 'customerId query parameter is required'
        });
    }

    let orders = ordersData.orders.filter(order => order.customerId === customerId);

    // Filter by status if provided
    if (status) {
        orders = orders.filter(order => order.status === status.toUpperCase());
    }

    // Apply limit
    orders = orders.slice(0, parseInt(limit));

    // Simulate network delay
    setTimeout(() => {
        res.json({
            customerId,
            count: orders.length,
            orders
        });
    }, 120);
});

// Get single order by ID
router.get('/orders/:orderId', (req, res) => {
    const { orderId } = req.params;

    const order = ordersData.orders.find(o => o.orderId === orderId);

    if (!order) {
        return res.status(404).json({
            error: 'Order not found',
            orderId
        });
    }

    setTimeout(() => {
        res.json(order);
    }, 100);
});

// Get order statistics for a customer
router.get('/orders/stats/:customerId', (req, res) => {
    const { customerId } = req.params;

    const customerOrders = ordersData.orders.filter(order => order.customerId === customerId);

    const stats = {
        customerId,
        totalOrders: customerOrders.length,
        totalSpent: customerOrders.reduce((sum, order) => sum + order.totalAmount, 0),
        ordersByStatus: {
            pending: customerOrders.filter(o => o.status === 'PENDING').length,
            confirmed: customerOrders.filter(o => o.status === 'CONFIRMED').length,
            shipped: customerOrders.filter(o => o.status === 'SHIPPED').length,
            delivered: customerOrders.filter(o => o.status === 'DELIVERED').length,
            returned: customerOrders.filter(o => o.status === 'RETURNED').length,
            cancelled: customerOrders.filter(o => o.status === 'CANCELLED').length
        },
        lastOrderDate: customerOrders.length > 0
            ? customerOrders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate))[0].orderDate
            : null
    };

    res.json(stats);
});

module.exports = router;