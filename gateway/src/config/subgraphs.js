/**
 * Subgraph Configuration
 * 
 * Defines all federated subgraphs that the gateway will connect to.
 * Add new subgraphs here as they are built.
 */

export const config = {
    subgraphs: [
        {
            name: 'customer',
            url: process.env.CUSTOMER_SUBGRAPH_URL || 'http://localhost:4001/graphql',
        },
        // TODO: Add more subgraphs as they are built
        // {
        //   name: 'order',
        //   url: process.env.ORDER_SUBGRAPH_URL || 'http://localhost:4002/graphql',
        // },
        // {
        //   name: 'billing',
        //   url: process.env.BILLING_SUBGRAPH_URL || 'http://localhost:4003/graphql',
        // },
        // {
        //   name: 'support',
        //   url: process.env.SUPPORT_SUBGRAPH_URL || 'http://localhost:4004/graphql',
        // },
    ],
};

export default config;