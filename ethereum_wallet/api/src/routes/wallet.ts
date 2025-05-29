import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createWalletForUser, getWalletForUser, transferToken, swapToken, handleAgentMessage } from '../../../agent/src/ethereumAgent';
import { AgentMessageRequest, WalletRequest, ApiResponse, TransferTokenParams, SwapTokenParams } from '../types';

export default async function walletRoutes(fastify: FastifyInstance) {
  // Create wallet
  fastify.post<{ Body: WalletRequest }>('/create', {
    schema: {
      body: {
        type: 'object',
        required: ['userPk'],
        properties: {
          userPk: { type: 'string' }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Body: WalletRequest }>, reply: FastifyReply) => {
      try {
        const { userPk } = request.body;
        const walletAddress = await createWalletForUser(userPk);
        console.log('walletAddress', walletAddress);
        const response: ApiResponse<{ address: string }> = {
          success: true,
          data: { address: walletAddress }
        };
        console.log('response', response);
        return reply.send(response);
      } catch (error: any) {
        console.log('error', error);
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          error: error.message
        };
        return reply.status(500).send(response);
      }
    }
  });

  // Get wallet
  fastify.get<{ Querystring: WalletRequest }>('/get', {
    schema: {
      querystring: {
        type: 'object',
        required: ['userPk'],
        properties: {
          userPk: { type: 'string' }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Querystring: WalletRequest }>, reply: FastifyReply) => {
      try {
        const { userPk } = request.query;
        console.log('userPk', userPk);
        const walletAddress = await getWalletForUser(userPk);
        console.log('walletAddress', walletAddress);
        const response: ApiResponse<{ address: string }> = {
          success: true,
          data: { address: walletAddress }
        };
        console.log('response', response);
        return reply.send(response);
      } catch (error: any) {
        console.log('error', error);
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          error: error.message
        };
        return reply.status(500).send(response);
      }
    }
  });

  // Transfer tokens
  fastify.post<{ Body: { userPk: string } & TransferTokenParams }>('/transfer', {
    schema: {
      body: {
        type: 'object',
        required: ['userPk', 'token', 'amount', 'to'],
        properties: {
          userPk: { type: 'string' },
          token: { type: 'string' },
          amount: { type: 'string' },
          to: { type: 'string' }
        }
      }
    },
    handler: async (
      request: FastifyRequest<{ Body: { userPk: string } & TransferTokenParams }>,
      reply: FastifyReply
    ) => {
      try {
        const { userPk, ...params } = request.body;
        const walletAddress = await getWalletForUser(userPk);
        const result = await transferToken(walletAddress, params);
        const response: ApiResponse<{ message: string }> = {
          success: true,
          data: { message: result }
        };
        return reply.send(response);
      } catch (error: any) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          error: error.message
        };
        return reply.status(500).send(response);
      }
    }
  });

  // Swap tokens
  fastify.post<{ Body: { userPk: string } & SwapTokenParams }>('/swap', {
    schema: {
      body: {
        type: 'object',
        required: ['userPk', 'fromToken', 'toToken', 'amount'],
        properties: {
          userPk: { type: 'string' },
          fromToken: { type: 'string' },
          toToken: { type: 'string' },
          amount: { type: 'string' }
        }
      }
    },
    handler: async (
      request: FastifyRequest<{ Body: { userPk: string } & SwapTokenParams }>,
      reply: FastifyReply
    ) => {
      try {
        const { userPk, ...params } = request.body;
        const walletAddress = await getWalletForUser(userPk);
        const result = await swapToken(walletAddress, params);
        const response: ApiResponse<{ message: string }> = {
          success: true,
          data: { message: result }
        };
        return reply.send(response);
      } catch (error: any) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          error: error.message
        };
        return reply.status(500).send(response);
      }
    }
  });

  // AI Agent endpoint
  fastify.post<{ Body: AgentMessageRequest }>('/agent', {
    schema: {
      body: {
        type: 'object',
        required: ['message', 'userPk'],
        properties: {
          message: { type: 'string' },
          userPk: { type: 'string' },
          params: {
            type: 'object',
            additionalProperties: true
          }
        }
      }
    },
    handler: async (request: FastifyRequest<{ Body: AgentMessageRequest }>, reply: FastifyReply) => {
      try {
        const { message, userPk, params } = request.body;
        const result = await handleAgentMessage(message, userPk, params);
        const response: ApiResponse<{ message: string }> = {
          success: true,
          data: { message: result }
        };
        return reply.send(response);
      } catch (error: any) {
        const response: ApiResponse<null> = {
          success: false,
          data: null,
          error: error.message
        };
        return reply.status(500).send(response);
      }
    }
  });
} 