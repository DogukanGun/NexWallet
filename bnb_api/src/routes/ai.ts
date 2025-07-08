import { FastifyPluginAsync } from 'fastify';
import { aiService } from '../services/aiService';

export const aiRoutes: FastifyPluginAsync = async (fastify) => {
  
  // Trigger AI verification manually
  fastify.post('/verify/:escrowId', async (request, reply) => {
    try {
      const { escrowId } = request.params as any;
      
      const result = await aiService.verifyReceipt(escrowId);
      
      if (!result.success) {
        return reply.status(500).send(result);
      }
      
      return {
        success: true,
        data: result.verificationResult,
        message: 'AI verification completed'
      };
    } catch (error: any) {
      fastify.log.error('AI verification error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to verify receipt with AI'
      });
    }
  });

  // Get verification status
  fastify.get('/status/:escrowId', async (request, reply) => {
    try {
      const { escrowId } = request.params as any;
      
      const result = await aiService.getVerificationStatus(escrowId);
      
      if (!result.success) {
        return reply.status(404).send(result);
      }
      
      return result;
    } catch (error: any) {
      fastify.log.error('Get verification status error:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to get verification status'
      });
    }
  });
}; 