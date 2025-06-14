package com.enterprise.customer360.customer.resolver;

import com.enterprise.customer360.customer.model.Customer;
import com.enterprise.customer360.customer.service.CustomerService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

/**
 * Customer Query Resolver
 *
 * Handles GraphQL queries for customer data.
 * This is where GraphQL queries are mapped to service methods.
 */
@Slf4j
@Controller
public class CustomerQueryResolver {

    private final CustomerService customerService;

    public CustomerQueryResolver(CustomerService customerService) {
        this.customerService = customerService;
        log.info("CustomerQueryResolver initialized");
    }

    /**
     * GraphQL Query: customer(customerId: ID!): Customer
     *
     * Fetches a single customer by ID
     */
    @QueryMapping
    public Customer customer(@Argument String customerId) {
        log.info("GraphQL Query: customer(customerId: {})", customerId);

        return customerService.getCustomerById(customerId)
                .orElseThrow(() -> {
                    log.warn("Customer not found: {}", customerId);
                    return new RuntimeException("Customer not found: " + customerId);
                });
    }

    /**
     * GraphQL Query: searchCustomers(query: String!): [Customer!]!
     *
     * Searches for customers by name or email
     */
    @QueryMapping
    public List<Customer> searchCustomers(@Argument String query) {
        log.info("GraphQL Query: searchCustomers(query: {})", query);

        List<Customer> customers = customerService.searchCustomers(query);
        log.info("Found {} customers", customers.size());

        return customers;
    }
}