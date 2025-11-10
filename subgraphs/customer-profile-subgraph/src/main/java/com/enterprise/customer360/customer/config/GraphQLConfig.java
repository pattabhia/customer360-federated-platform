package com.enterprise.customer360.customer.config;

import com.apollographql.federation.graphqljava.Federation;
import com.apollographql.federation.graphqljava._Entity;
import com.enterprise.customer360.customer.model.Customer;
import com.enterprise.customer360.customer.service.CustomerService;
import graphql.schema.DataFetcher;
import graphql.schema.TypeResolver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.graphql.GraphQlSourceBuilderCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * GraphQL Configuration for Apollo Federation
 *
 * This configuration enables Apollo Federation support in Spring for GraphQL.
 * It properly declares Federation directives and registers entity resolvers.
 */
@Slf4j
@Configuration
@RequiredArgsConstructor
public class GraphQLConfig {

    private final CustomerService customerService;

    /**
     * Customize GraphQL Source Builder to add Federation support
     *
     * This is the key to making Federation work with Spring for GraphQL.
     * It declares Federation directives and registers the entity resolver.
     */
    @Bean
    public GraphQlSourceBuilderCustomizer federationTransform() {
        return builder -> {
            log.info("Configuring Apollo Federation support");

            // Create entity data fetcher for Federation
            DataFetcher<Object> entityDataFetcher = env -> {
                List<Map<String, Object>> representations = env.getArgument(_Entity.argumentName);

                return representations.stream()
                        .map(representation -> {
                            String typename = (String) representation.get("__typename");

                            if ("Customer".equals(typename)) {
                                String customerId = (String) representation.get("customerId");
                                log.debug("Federation: Resolving Customer entity for customerId: {}", customerId);

                                return customerService.getCustomerById(customerId)
                                        .orElseThrow(() -> new RuntimeException("Customer not found: " + customerId));
                            }

                            return null;
                        })
                        .collect(Collectors.toList());
            };

            // Type resolver for _Entity union
            TypeResolver entityTypeResolver = env -> {
                Object object = env.getObject();
                if (object instanceof Customer) {
                    return env.getSchema().getObjectType("Customer");
                }
                return null;
            };

            // Transform the schema with Federation directives
            builder.schemaFactory((typeDefinitionRegistry, runtimeWiring) -> {
                log.info("Building federated GraphQL schema");

                return Federation.transform(typeDefinitionRegistry, runtimeWiring)
                        .fetchEntities(entityDataFetcher)
                        .resolveEntityType(entityTypeResolver)
                        .build();
            });

            log.info("Apollo Federation support configured successfully");
        };
    }
}