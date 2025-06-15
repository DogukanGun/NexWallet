import { FastifyPluginAsync } from 'fastify';
import mongoose from 'mongoose';

export const healthRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Basic health check
  fastify.get('/', async (request, reply) => {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      service: 'AutoPayer API'
    };
  });

  // Detailed health check
  fastify.get('/detailed', async (request, reply) => {
    try {
      const dbConnected = mongoose.connection.readyState === 1;
      
      const health = {
        status: dbConnected ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'AutoPayer API',
        checks: {
          database: {
            status: dbConnected ? 'connected' : 'disconnected',
            responseTime: dbConnected ? '< 10ms' : 'N/A'
          },
          api: {
            status: 'operational',
            uptime: process.uptime()
          }
        }
      };

      if (!dbConnected) {
        return reply.status(503).send(health);
      }

      return health;
    } catch (error: any) {
      return reply.status(503).send({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });
}; 