package com.enterprise.customer360.customer.model;

/**
 * Customer Segment Enum
 *
 * Represents the tier/segment of a customer based on their value
 */
public enum CustomerSegment {
    /**
     * Highest tier - Premium customers
     */
    PLATINUM,

    /**
     * High value customers
     */
    GOLD,

    /**
     * Standard customers
     */
    SILVER,

    /**
     * Entry level customers
     */
    BRONZE
}