import fastify from 'fastify';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import mongoose from 'mongoose';
import { config } from './config/config';
import { escrowRoutes } from './routes/escrow';
import { healthRoutes } from './routes/health';
import { fileRoutes } from './routes/files';
import { aiRoutes } from './routes/ai';


// Create Fastify instance
const server = fastify({
  logger: {
    level: config.NODE_ENV === 'development' ? 'info' : 'warn',
  }
});

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(config.MONGODB_URI);
    server.log.info('Connected to MongoDB');
  } catch (error) {
    server.log.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// Register plugins
async function registerPlugins() {
  // CORS
  await server.register(cors, {
    origin: true,
    credentials: true
  });

  // Multipart for file uploads
  await server.register(multipart, {
    limits: {
      fileSize: config.MAX_FILE_SIZE
    }
  });

  // Swagger documentation
  await server.register(swagger, {
    openapi: {
      info: {
        title: 'AutoPayer API',
        description: 'P2P Escrow API with AI verification',
        version: '1.0.0'
      },
      servers: [
        {
          url: `http://localhost:${config.PORT}`,
          description: 'Development server'
        }
      ]
    }
  });

  await server.register(swaggerUi, {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    }
  });
}

// Register routes
async function registerRoutes() {
  await server.register(healthRoutes, { prefix: '/api/health' });
  await server.register(escrowRoutes, { prefix: '/api/escrow' });
  await server.register(fileRoutes, { prefix: '/api/files' });
  await server.register(aiRoutes, { prefix: '/api/ai' });
}

// Global error handler
server.setErrorHandler((error, request, reply) => {
  server.log.error(error);
  
  if (error.validation) {
    return reply.status(400).send({
      error: 'Validation Error',
      message: error.message,
      details: error.validation
    });
  }

  const statusCode = error.statusCode || 500;
  reply.status(statusCode).send({
    error: error.name || 'Internal Server Error',
    message: error.message || 'Something went wrong'
  });
});

// Graceful shutdown
async function gracefulShutdown() {
  try {
    server.log.info('Shutting down gracefully...');
    await mongoose.disconnect();
    await server.close();
    process.exit(0);
  } catch (error) {
    server.log.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
async function start() {
  try {
    await connectDB();
    await registerPlugins();
    await registerRoutes();
    
    await server.listen({ 
      port: config.PORT, 
      host: '0.0.0.0' 
    });
    
    server.log.info(`🚀 AutoPayer API running on http://localhost:${config.PORT}`);
    server.log.info(`📚 API Documentation: http://localhost:${config.PORT}/docs`);
  } catch (error) {
    server.log.error('Failed to start server:', error);
    process.exit(1);
  }
}

start(); 