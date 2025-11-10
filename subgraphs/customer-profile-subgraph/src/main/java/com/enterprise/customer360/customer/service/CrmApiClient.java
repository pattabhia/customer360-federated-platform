package com.enterprise.customer360.customer.service;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import com.enterprise.customer360.customer.dto.CrmCustomerResponse;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;

/**
 * CRM API Client
 * 
 * Communicates with the legacy CRM system (mock API) to fetch customer data.
 * In production, this would connect to the actual CRM system (e.g., SAP).
 */
@Slf4j
@Component
public class CrmApiClient {

    private final RestTemplate restTemplate;
    private final String crmApiBaseUrl;

    public CrmApiClient(
            RestTemplate restTemplate,
            @Value("${crm.api.base-url}") String crmApiBaseUrl) {
        this.restTemplate = restTemplate;
        this.crmApiBaseUrl = crmApiBaseUrl;
    }

    @PostConstruct
    public void init() {
        log.info("CRM API Client initialized with base URL: {}", crmApiBaseUrl);
    }

    /**
     * Get customer by ID from CRM API
     * 
     * @param customerId Customer ID
     * @return Customer response from CRM
     */
    public CrmCustomerResponse getCustomerById(String customerId) {
        String url = crmApiBaseUrl + "/api/customers/" + customerId;

        try {
            log.debug("Fetching customer from CRM API: {}", url);
            CrmCustomerResponse response = restTemplate.getForObject(url, CrmCustomerResponse.class);
            log.debug("Successfully fetched customer: {}", customerId);
            return response;
        } catch (RestClientException e) {
            log.error("Error fetching customer {} from CRM API: {}", customerId, e.getMessage());
            throw new RuntimeException("Failed to fetch customer from CRM: " + e.getMessage(), e);
        }
    }

    /**
     * Search customers by query string
     * 
     * @param query Search query (name or email)
     * @return List of matching customers
     */
    public List<CrmCustomerResponse> searchCustomers(String query) {
        String url = crmApiBaseUrl + "/api/customers/search?query=" + query;

        try {
            log.debug("Searching customers in CRM API with query: {}", query);
            CrmCustomerResponse[] response = restTemplate.getForObject(url, CrmCustomerResponse[].class);

            if (response != null) {
                log.debug("Found {} customers matching query: {}", response.length, query);
                return Arrays.asList(response);
            }

            return Collections.emptyList();
        } catch (RestClientException e) {
            log.error("Error searching customers in CRM API: {}", e.getMessage());
            return Collections.emptyList();
        }
    }
}