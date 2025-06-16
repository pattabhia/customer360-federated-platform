import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import express from 'express';
import cors from 'cors';
import { config } from './config/subgraphs.js';
import { createLogger } from './utils/logger.js';

const logger = createLogger();

/**
 * Apollo Federation Gateway
 * 
 * This gateway orchestrates multiple GraphQL subgraphs into a unified API.
 * It handles:
 * - Schema composition from subgraphs
 * - Query planning and execution
 * - Entity resolution across services
 * 
 * Architecture:
 * Client → Gateway (4000) → Subgraphs (4001, 4002, 4003, 4004)
 */

// Port configuration
const PORT = process.env.GATEWAY_PORT || 4000;

async function startGateway() {
    logger.info('🚀 Starting Apollo Federation Gateway...');

    try {
        // Initialize Apollo Gateway
        logger.info('Initializing gateway with subgraph configuration...');
        const gateway = new ApolloGateway({
            supergraphSdl: new IntrospectAndCompose({
                subgraphs: config.subgraphs,
                pollIntervalInMs: 10000, // Poll for schema changes every 10 seconds
            }),
            // Service health check
            serviceHealthCheck: true,
            // Log gateway events
            debug: process.env.NODE_ENV !== 'production',
        });

        // Create Apollo Server with Gateway
        logger.info('Creating Apollo Server...');
        const server = new ApolloServer({
            gateway,
            // Plugins for enhanced functionality
            plugins: [
                {
                    // Log requests
                    async requestDidStart() {
                        return {
                            async didEncounterErrors(requestContext) {
                                logger.error('GraphQL Error:', requestContext.errors);
                            },
                        };
                    },
                },
            ],
            // Enable introspection and playground
            introspection: true,
            // Format errors
            formatError: (error) => {
                logger.error('GraphQL error details:', error);
                return {
                    message: error.message,
                    locations: error.locations,
                    path: error.path,
                    extensions: {
                        code: error.extensions?.code,
                        timestamp: new Date().toISOString(),
                    },
                };
            },
        });

        // Start server
        await server.start();
        logger.info('✅ Apollo Server started successfully');

        // Setup Express
        const app = express();

        // Middleware
        app.use(cors({
            origin: [
                'http://localhost:4000',                 // Local query UI
                'http://localhost:3000',                 // If frontend runs here
                'https://studio.apollographql.com'       // Apollo Studio web UI
            ],
            credentials: true,
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: [
                'content-type',
                'apollographql-client-name',
                'apollographql-client-version',
                'x-apollo-operation-name',
                'x-apollo-tracing'
            ]
        }));

        app.use((_, res, next) => {
            res.setHeader('Access-Control-Allow-Private-Network', 'true');
            next();
        });

        app.use(express.json());

        // Health check endpoint
        app.get('/health', (req, res) => {
            res.json({
                status: 'healthy',
                service: 'apollo-gateway',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                subgraphs: config.subgraphs.map(s => ({
                    name: s.name,
                    url: s.url,
                })),
            });
        });

        // Info endpoint
        app.get('/info', (req, res) => {
            res.json({
                name: 'Customer360 Apollo Gateway',
                version: '1.0.0',
                description: 'Federated GraphQL Gateway for Customer360 Platform',
                endpoints: {
                    graphql: `http://localhost:${PORT}/graphql`,
                    health: `http://localhost:${PORT}/health`,
                    info: `http://localhost:${PORT}/info`,
                },
                subgraphs: config.subgraphs,
            });
        });

        // GraphQL endpoint
        app.use(
            '/graphql',
            expressMiddleware(server, {
                context: async ({ req }) => ({
                    headers: req.headers,
                    timestamp: new Date().toISOString(),
                }),
            })
        );

        // Start Express server
        app.listen(PORT, () => {
            logger.info('');
            logger.info('╔══════════════════════════════════════════════════════════════╗');
            logger.info('║                                                              ║');
            logger.info('║        Apollo Federation Gateway - STARTED! ✅              ║');
            logger.info('║                                                              ║');
            logger.info(`║  GraphQL Endpoint:  http://localhost:${PORT}/graphql           ║`);
            logger.info(`║  Apollo Sandbox:    https://studio.apollographql.com/sandbox║`);
            logger.info(`║                     ?endpoint=http://localhost:${PORT}/graphql║`);
            logger.info(`║  Health Check:      http://localhost:${PORT}/health            ║`);
            logger.info(`║  Info:              http://localhost:${PORT}/info              ║`);
            logger.info('║                                                              ║');
            logger.info('║  Connected Subgraphs:                                        ║');
            config.subgraphs.forEach(subgraph => {
                logger.info(`║    • ${subgraph.name.padEnd(20)} ${subgraph.url.padEnd(30)}║`);
            });
            logger.info('║                                                              ║');
            logger.info('║  Sample Query:                                               ║');
            logger.info('║  {                                                           ║');
            logger.info('║    customer(customerId: "CUST001") {                         ║');
            logger.info('║      firstName                                               ║');
            logger.info('║      lastName                                                ║');
            logger.info('║      email                                                   ║');
            logger.info('║      segment                                                 ║');
            logger.info('║    }                                                         ║');
            logger.info('║  }                                                           ║');
            logger.info('║                                                              ║');
            logger.info('╚══════════════════════════════════════════════════════════════╝');
            logger.info('');
        });

    } catch (error) {
        logger.error('❌ Failed to start gateway:', error);
        process.exit(1);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    logger.info('\n🛑 Shutting down gateway gracefully...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    logger.info('\n🛑 Shutting down gateway gracefully...');
    process.exit(0);
});

// Start the gateway
startGateway().catch((error) => {
    logger.error('Fatal error starting gateway:', error);
    process.exit(1);
});