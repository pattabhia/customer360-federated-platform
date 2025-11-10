package com.enterprise.customer360.customer.service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.enterprise.customer360.customer.dto.CrmCustomerResponse;
import com.enterprise.customer360.customer.model.Address;
import com.enterprise.customer360.customer.model.Customer;
import com.enterprise.customer360.customer.model.CustomerSegment;
import com.enterprise.customer360.customer.model.CustomerStatus;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

/**
 * Customer Service Implementation
 * 
 * Implements business logic for customer operations.
 * Maps data from CRM API to internal domain models.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CustomerServiceImpl implements CustomerService {

    private final CrmApiClient crmApiClient;

    // Constructor removed - Lombok @RequiredArgsConstructor generates it

    @PostConstruct
    public void init() {
        log.info("CustomerServiceImpl initialized and ready");
    }

    @Override
    public Optional<Customer> getCustomerById(String customerId) {
        log.info("Getting customer by ID: {}", customerId);

        try {
            CrmCustomerResponse crmResponse = crmApiClient.getCustomerById(customerId);

            if (crmResponse == null) {
                log.warn("Customer not found: {}", customerId);
                return Optional.empty();
            }

            Customer customer = mapToCustomer(crmResponse);
            log.info("Successfully retrieved customer: {}", customerId);
            return Optional.of(customer);

        } catch (Exception e) {
            log.error("Error retrieving customer {}: {}", customerId, e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public List<Customer> searchCustomers(String query) {
        log.info("Searching customers with query: {}", query);

        try {
            List<CrmCustomerResponse> crmResponses = crmApiClient.searchCustomers(query);

            List<Customer> customers = crmResponses.stream()
                    .map(this::mapToCustomer)
                    .collect(Collectors.toList());

            log.info("Found {} customers matching query: {}", customers.size(), query);
            return customers;

        } catch (Exception e) {
            log.error("Error searching customers: {}", e.getMessage());
            return List.of();
        }
    }

    /**
     * Map CRM API response to Customer domain model
     */
    private Customer mapToCustomer(CrmCustomerResponse crmResponse) {
        return Customer.builder()
                .customerId(crmResponse.getCustomerId())
                .firstName(crmResponse.getFirstName())
                .lastName(crmResponse.getLastName())
                .email(crmResponse.getEmail())
                .phone(crmResponse.getPhone())
                .dateOfBirth(crmResponse.getDateOfBirth())
                .address(mapToAddress(crmResponse.getAddress()))
                .segment(parseSegment(crmResponse.getSegment()))
                .status(parseStatus(crmResponse.getStatus()))
                .lifetimeValue(crmResponse.getLifetimeValue())
                .riskScore(crmResponse.getRiskScore())
                .createdAt(crmResponse.getCreatedAt())
                .lastUpdated(crmResponse.getLastUpdated())
                .build();
    }

    /**
     * Map address DTO to Address model
     */
    private Address mapToAddress(CrmCustomerResponse.AddressDTO addressDTO) {
        if (addressDTO == null) {
            return null;
        }

        return Address.builder()
                .street(addressDTO.getStreet())
                .city(addressDTO.getCity())
                .state(addressDTO.getState())
                .zipCode(addressDTO.getZipCode())
                .country(addressDTO.getCountry())
                .build();
    }

    /**
     * Parse segment string to enum
     */
    private CustomerSegment parseSegment(String segment) {
        try {
            return CustomerSegment.valueOf(segment.toUpperCase());
        } catch (Exception e) {
            log.warn("Invalid segment value: {}, defaulting to BRONZE", segment);
            return CustomerSegment.BRONZE;
        }
    }

    /**
     * Parse status string to enum
     */
    private CustomerStatus parseStatus(String status) {
        try {
            return CustomerStatus.valueOf(status.toUpperCase());
        } catch (Exception e) {
            log.warn("Invalid status value: {}, defaulting to ACTIVE", status);
            return CustomerStatus.ACTIVE;
        }
    }
}