package com.enterprise.customer360.customer.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.graphql.execution.RuntimeWiringConfigurer;

/**
 * GraphQL Configuration for Apollo Federation
 *
 * This configuration enables Apollo Federation support in Spring for GraphQL.
 * It registers the entity resolver that handles federation queries.
 */
@Slf4j
@Configuration
public class GraphQLConfig {

    /**
     * Configure Runtime Wiring for Federation
     *
     * This registers our entity resolver with the GraphQL schema,
     * enabling Apollo Gateway to resolve Customer entities.
     */
    @Bean
    public RuntimeWiringConfigurer runtimeWiringConfigurer() {
        return wiringBuilder -> {
            log.info("Configuring Apollo Federation runtime wiring");

            // This tells GraphQL how to resolve Customer entities
            // when they're referenced from other subgraphs
            wiringBuilder.type("Customer", builder ->
                    builder.dataFetcher("__resolveReference", env -> {
                        // The actual resolution is handled by CustomerEntityResolver
                        // This just registers that Customer is a federated entity
                        log.debug("Entity reference resolver registered for Customer");
                        return env.getSource();
                    })
            );

            log.info("Apollo Federation runtime wiring configured successfully");
        };
    }
}