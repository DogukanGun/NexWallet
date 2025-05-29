import fastify, { FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import walletRoutes from './routes/wallet';

const server: FastifyInstance = fastify({
  logger: true
});

// Register plugins
server.register(cors, {
  origin: true
});

// Swagger configuration
server.register(swagger, {
  swagger: {
    info: {
      title: 'Ethereum Wallet API',
      description: 'API for managing Ethereum wallets and AI agent interaction',
      version: '1.0.0'
    },
    host: 'localhost:8005',
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json']
  }
});

server.register(swaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false
  },
  staticCSP: true
});

// Register routes
server.register(walletRoutes, { prefix: '/api/wallet' });

// Health check route
server.get('/health', async () => {
  return { status: 'ok' };
});

// Start the server
const start = async () => {
  try {
    await server.listen({ port: 8005, host: '0.0.0.0' });
    console.log('Server is running on http://localhost:8005');
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 