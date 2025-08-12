const express = require('express');
const router = express.Router();
const ticketsData = require('../data/tickets.json');

// Get tickets by customer ID
router.get('/tickets', (req, res) => {
    const { customerId, status, priority } = req.query;

    if (!customerId) {
        return res.status(400).json({
            error: 'customerId query parameter is required'
        });
    }

    let tickets = ticketsData.tickets.filter(ticket => ticket.customerId === customerId);

    // Filter by status if provided
    if (status) {
        tickets = tickets.filter(ticket => ticket.status === status.toUpperCase());
    }

    // Filter by priority if provided
    if (priority) {
        tickets = tickets.filter(ticket => ticket.priority === priority.toUpperCase());
    }

    // Simulate network delay
    setTimeout(() => {
        res.json({
            customerId,
            count: tickets.length,
            tickets
        });
    }, 140);
});

// Get single ticket by ID
router.get('/tickets/:ticketId', (req, res) => {
    const { ticketId } = req.params;

    const ticket = ticketsData.tickets.find(t => t.ticketId === ticketId);

    if (!ticket) {
        return res.status(404).json({
            error: 'Ticket not found',
            ticketId
        });
    }

    setTimeout(() => {
        res.json(ticket);
    }, 100);
});

// Get support statistics for a customer
router.get('/tickets/stats/:customerId', (req, res) => {
    const { customerId } = req.params;

    const customerTickets = ticketsData.tickets.filter(ticket => ticket.customerId === customerId);

    // Calculate average resolution time for closed tickets
    const closedTickets = customerTickets.filter(t => t.status === 'CLOSED' || t.status === 'RESOLVED');
    let avgResolutionTime = 0;

    if (closedTickets.length > 0) {
        const totalResolutionTime = closedTickets.reduce((sum, ticket) => {
            const created = new Date(ticket.createdAt);
            const updated = new Date(ticket.updatedAt);
            return sum + (updated - created) / (1000 * 60 * 60 * 24); // in days
        }, 0);
        avgResolutionTime = totalResolutionTime / closedTickets.length;
    }

    const stats = {
        customerId,
        totalTickets: customerTickets.length,
        openTickets: customerTickets.filter(t => t.status === 'OPEN').length,
        inProgressTickets: customerTickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolvedTickets: customerTickets.filter(t => t.status === 'RESOLVED').length,
        closedTickets: customerTickets.filter(t => t.status === 'CLOSED').length,
        ticketsByPriority: {
            critical: customerTickets.filter(t => t.priority === 'CRITICAL').length,
            high: customerTickets.filter(t => t.priority === 'HIGH').length,
            medium: customerTickets.filter(t => t.priority === 'MEDIUM').length,
            low: customerTickets.filter(t => t.priority === 'LOW').length
        },
        ticketsByCategory: {
            billing: customerTickets.filter(t => t.category === 'BILLING_ISSUE').length,
            technical: customerTickets.filter(t => t.category === 'TECHNICAL_SUPPORT').length,
            account: customerTickets.filter(t => t.category === 'ACCOUNT_MANAGEMENT').length,
            complaint: customerTickets.filter(t => t.category === 'COMPLAINT').length,
            feature: customerTickets.filter(t => t.category === 'FEATURE_REQUEST').length
        },
        averageResolutionTime: avgResolutionTime.toFixed(2) + ' days',
        lastTicketDate: customerTickets.length > 0
            ? customerTickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0].createdAt
            : null
    };

    res.json(stats);
});

module.exports = router;