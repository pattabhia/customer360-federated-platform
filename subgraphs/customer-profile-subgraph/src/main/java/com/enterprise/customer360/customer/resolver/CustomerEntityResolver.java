package com.enterprise.customer360.customer.resolver;

import java.util.Map;

import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import com.enterprise.customer360.customer.model.Customer;
import com.enterprise.customer360.customer.service.CustomerService;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Customer Entity Resolver
 * 
 * ⭐ THIS IS THE FEDERATION MAGIC! ⭐
 * 
 * This resolver handles entity resolution for Apollo Federation.
 * Other subgraphs (Order, Billing, Support) will reference Customer by
 * customerId,
 * and the gateway will call this resolver to fetch the complete Customer
 * object.
 * 
 * For example:
 * - Order subgraph returns: { customerId: "CUST001" }
 * - Gateway calls this resolver: resolveCustomerReference({ customerId:
 * "CUST001" })
 * - This resolver fetches and returns the full Customer object
 * - Gateway merges the data together
 * 
 * This is what enables "extending" the Customer entity across multiple
 * services!
 */
@Slf4j
@Controller
@RequiredArgsConstructor
public class CustomerEntityResolver {

    private final CustomerService customerService;

    @PostConstruct
    public void init() {
        log.info("CustomerEntityResolver initialized - Federation ready!");
    }

    /**
     * Resolve Customer entity reference
     * 
     * This method is called by Apollo Gateway when other subgraphs reference
     * a Customer entity. The gateway passes a map containing the key field(s)
     * defined in the schema (@key(fields: "customerId")).
     * 
     * @param reference Map containing the key field (customerId)
     * @return Resolved Customer entity
     */
    @SchemaMapping(typeName = "Customer")
    public Customer resolveReference(Map<String, Object> reference) {
        String customerId = (String) reference.get("customerId");

        log.info("Federation: Resolving Customer reference for customerId: {}", customerId);
        log.debug("Reference map: {}", reference);

        Customer customer = customerService.getCustomerById(customerId)
                .orElseThrow(() -> {
                    log.error("Federation: Customer not found for customerId: {}", customerId);
                    return new RuntimeException("Customer not found: " + customerId);
                });

        log.info("Federation: Successfully resolved Customer: {} {}",
                customer.getFirstName(), customer.getLastName());

        return customer;
    }
}