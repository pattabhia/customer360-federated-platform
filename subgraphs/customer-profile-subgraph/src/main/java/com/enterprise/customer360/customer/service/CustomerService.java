package com.enterprise.customer360.customer.service;

import com.enterprise.customer360.customer.model.Customer;

import java.util.List;
import java.util.Optional;

/**
 * Customer Service Interface
 *
 * Defines operations for customer management
 */
public interface CustomerService {

    /**
     * Get customer by ID
     *
     * @param customerId Customer ID
     * @return Optional containing customer if found
     */
    Optional<Customer> getCustomerById(String customerId);

    /**
     * Search customers by query string
     *
     * @param query Search query (name or email)
     * @return List of matching customers
     */
    List<Customer> searchCustomers(String query);
}