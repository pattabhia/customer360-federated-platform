package com.enterprise.customer360.customer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Customer domain model
 *
 * Represents a customer entity in the system.
 * This is the core federated entity identified by customerId.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    /**
     * Unique customer identifier
     * This is the federation key field
     */
    private String customerId;

    /**
     * Customer's first name
     */
    private String firstName;

    /**
     * Customer's last name
     */
    private String lastName;

    /**
     * Customer's email address
     */
    private String email;

    /**
     * Customer's phone number
     */
    private String phone;

    /**
     * Customer's date of birth (ISO format)
     */
    private String dateOfBirth;

    /**
     * Customer's address
     */
    private Address address;

    /**
     * Customer segment (PLATINUM, GOLD, SILVER, BRONZE)
     */
    private CustomerSegment segment;

    /**
     * Customer account status
     */
    private CustomerStatus status;

    /**
     * Customer lifetime value in dollars
     */
    private Double lifetimeValue;

    /**
     * Customer risk score (0-100, higher = more risk)
     */
    private Integer riskScore;

    /**
     * Account creation timestamp (ISO format)
     */
    private String createdAt;

    /**
     * Last update timestamp (ISO format)
     */
    private String lastUpdated;
}