package com.enterprise.customer360.customer.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Address model
 *
 * Represents a customer's address information
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Address {

    /**
     * Street address
     */
    private String street;

    /**
     * City
     */
    private String city;

    /**
     * State or province
     */
    private String state;

    /**
     * Postal/ZIP code
     */
    private String zipCode;

    /**
     * Country
     */
    private String country;
}