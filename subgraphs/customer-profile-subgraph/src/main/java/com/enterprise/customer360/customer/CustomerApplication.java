package com.enterprise.customer360.customer;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

/**
 * Customer Profile Subgraph Application
 *
 * This service provides federated GraphQL API for customer profile data.
 * It connects to legacy CRM system (mock) and exposes customer information
 * through Apollo Federation.
 *
 * Port: 4001
 * GraphQL Endpoint: http://localhost:4001/graphql
 * GraphiQL UI: http://localhost:4001/graphiql
 */
@SpringBootApplication
@ConfigurationPropertiesScan
public class CustomerApplication {

    public static void main(String[] args) {
        SpringApplication.run(CustomerApplication.class, args);
        System.out.println("\n" +
                "╔══════════════════════════════════════════════════════════╗\n" +
                "║                                                          ║\n" +
                "║     Customer Profile Subgraph - STARTED! ✅             ║\n" +
                "║                                                          ║\n" +
                "║  GraphQL Endpoint: http://localhost:4001/graphql        ║\n" +
                "║  GraphiQL UI:      http://localhost:4001/graphiql       ║\n" +
                "║  Health Check:     http://localhost:4001/actuator/health║\n" +
                "║                                                          ║\n" +
                "║  Sample Query:                                           ║\n" +
                "║  {                                                       ║\n" +
                "║    customer(customerId: \"CUST001\") {                  ║\n" +
                "║      firstName                                           ║\n" +
                "║      lastName                                            ║\n" +
                "║      email                                               ║\n" +
                "║      segment                                             ║\n" +
                "║    }                                                     ║\n" +
                "║  }                                                       ║\n" +
                "║                                                          ║\n" +
                "╚══════════════════════════════════════════════════════════╝\n");
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
