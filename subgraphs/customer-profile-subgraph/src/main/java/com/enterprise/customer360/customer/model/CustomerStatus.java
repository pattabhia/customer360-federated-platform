package com.enterprise.customer360.customer.model;

/**
 * Customer Status Enum
 *
 * Represents the current status of a customer account
 */
public enum CustomerStatus {
    /**
     * Account is active and in good standing
     */
    ACTIVE,

    /**
     * Account is inactive (no recent activity)
     */
    INACTIVE,

    /**
     * Account has been suspended
     */
    SUSPENDED,

    /**
     * VIP customer with special privileges
     */
    VIP
}