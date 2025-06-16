import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloGateway, IntrospectAndCompose } from '@apollo/gateway';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
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
            // Enable introspection for Studio
            introspection: true,
            // Plugins for enhanced functionality
            plugins: [
                // Enable Apollo Studio Explorer in development
                ApolloServerPluginLandingPageLocalDefault({
                    embed: true,
                    includeCookies: true,
                }),
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
            // CRITICAL: Enable CORS for Apollo Studio
            csrfPrevention: false,
        });

        // Start server
        await server.start();
        logger.info('✅ Apollo Server started successfully');

        // Setup Express
        const app = express();

        // ENHANCED CORS Configuration for Apollo Studio
        app.use(cors({
            origin: '*', // Allow all origins (including Apollo Studio)
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: [
                'Content-Type',
                'Authorization',
                'apollo-require-preflight',
                'x-apollo-operation-name',
                'apollo-query-plan-experimental',
            ],
            credentials: true,
            exposedHeaders: ['*'],
        }));

        // Parse JSON bodies
        app.use(express.json({ limit: '10mb' }));

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

        // GraphQL endpoint with proper headers
        app.use(
            '/graphql',
            expressMiddleware(server, {
                context: async ({ req }) => ({
                    headers: req.headers,
                    timestamp: new Date().toISOString(),
                }),
            })
        );

        // Root endpoint - redirect to /graphql
        app.get('/', (req, res) => {
            res.redirect('/graphql');
        });

        // Start Express server
        app.listen(PORT, () => {
            logger.info('');
            logger.info('╔══════════════════════════════════════════════════════════════╗');
            logger.info('║                                                              ║');
            logger.info('║        Apollo Federation Gateway - STARTED! ✅              ║');
            logger.info('║                                                              ║');
            logger.info(`║  GraphQL Endpoint:  http://localhost:${PORT}/graphql           ║`);
            logger.info('║                                                              ║');
            logger.info('║  🌐 OPEN IN BROWSER: http://localhost:4000/graphql          ║');
            logger.info('║     (Built-in Apollo Studio Explorer)                       ║');
            logger.info('║                                                              ║');
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
            logger.info('💡 TIP: Open http://localhost:4000/graphql in your browser!');
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