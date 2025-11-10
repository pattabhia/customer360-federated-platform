package com.enterprise.customer360.customer.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * CRM API Response DTO
 *
 * Maps the response from the legacy CRM API (mock)
 * to our internal Customer model
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class CrmCustomerResponse {

    private String customerId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String dateOfBirth;
    private AddressDTO address;
    private String segment;
    private String status;
    private Double lifetimeValue;
    private Integer riskScore;
    private String createdAt;
    private String lastUpdated;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class AddressDTO {
        private String street;
        private String city;
        private String state;
        private String zipCode;
        private String country;
    }
}