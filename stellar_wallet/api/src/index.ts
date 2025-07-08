import fastify, { FastifyRequest, FastifyReply } from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';
import { getOrCreateWallet, getWalletBalance, buildPaymentTransaction, buildTrustlineTransaction } from './wallet';

dotenv.config();

const server = fastify({
  logger: true,
});

// Enable CORS
server.register(cors, {
  origin: process.env.FRONTEND_URL || '*',
});

// Register Swagger plugins BEFORE routes
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Stellar Wallet API',
      description: 'API for managing Stellar wallets by Twitter ID',
      version: '1.0.0',
    },
    servers: [
      { url: 'http://localhost:3001', description: 'Local server' },
    ],
  },
});
server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: {
    docExpansion: 'full',
    deepLinking: false,
  },
});

// All routes must be registered AFTER swagger plugins

// Health check route
server.get('/health', {
  schema: {
    response: {
      200: {
        type: 'object',
        properties: {
          status: { type: 'string' },
        },
      },
    },
    tags: ['Health'],
    summary: 'Health check',
    description: 'Returns status ok if the server is running.',
    operationId: 'healthCheck',
  },
}, async () => {
  return { status: 'ok' };
});

// Create or get wallet route
server.post('/wallet', {
  schema: {
    body: { type: 'object', properties: { twitterId: { type: 'string' } }, required: ['twitterId'] },
    response: {
      200: {
        type: 'object',
        properties: {
          publicKey: { type: 'string' },
          isNewWallet: { type: 'boolean' },
        },
      },
      500: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
    tags: ['Wallet'],
    summary: 'Create or get a Stellar wallet by Twitter ID',
    description: 'Returns the public key for the user. If a wallet does not exist, creates one and funds it (testnet only).',
    operationId: 'createOrGetWallet',
  },
}, async (request: FastifyRequest<{
  Body: { twitterId: string }
}>, reply: FastifyReply) => {
  try {
    const { twitterId } = request.body;
    const wallet = await getOrCreateWallet(twitterId);
    return wallet;
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      code: 'WALLET_ERROR',
      message: 'Failed to create or fetch wallet',
    });
  }
});

// Get wallet balance route
server.post('/wallet/balance', {
  schema: {
    body: { type: 'object', properties: { publicKey: { type: 'string' } }, required: ['publicKey'] },
    response: {
      200: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            asset: { type: 'string' },
            balance: { type: 'string' },
            issuer: { type: ['string', 'null'] },
          },
        },
      },
      500: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
    tags: ['Wallet'],
    summary: 'Get wallet balance',
    description: 'Returns the balance for the given Stellar public key.',
    operationId: 'getWalletBalance',
  },
}, async (request: FastifyRequest<{
  Body: { publicKey: string }
}>, reply: FastifyReply) => {
  try {
    const { publicKey } = request.body;
    const balances = await getWalletBalance(publicKey);
    return balances;
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      code: 'BALANCE_ERROR',
      message: 'Failed to fetch wallet balance',
    });
  }
});

// Build payment transaction route
server.post('/wallet/payment', {
  schema: {
    body: {
      type: 'object',
      properties: {
        sourcePublicKey: { type: 'string' },
        destinationPublicKey: { type: 'string' },
        amount: { type: 'string' },
        assetCode: { type: 'string', default: 'XLM' },
        assetIssuer: { type: ['string', 'null'], default: null },
      },
      required: ['sourcePublicKey', 'destinationPublicKey', 'amount'],
    },
    response: {
      200: { type: 'string', description: 'Transaction XDR' },
      500: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
    tags: ['Wallet'],
    summary: 'Build payment transaction',
    description: 'Builds a payment transaction XDR for the given parameters.',
    operationId: 'buildPaymentTransaction',
  },
}, async (request: FastifyRequest<{
  Body: { sourcePublicKey: string, destinationPublicKey: string, amount: string, assetCode?: string, assetIssuer?: string }
}>, reply: FastifyReply) => {
  try {
    const { sourcePublicKey, destinationPublicKey, amount, assetCode, assetIssuer } = request.body;
    const xdr = await buildPaymentTransaction(sourcePublicKey, destinationPublicKey, amount, assetCode, assetIssuer);
    return xdr;
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      code: 'PAYMENT_ERROR',
      message: 'Failed to build payment transaction',
    });
  }
});

// Build trustline transaction route
server.post('/wallet/trustline', {
  schema: {
    body: {
      type: 'object',
      properties: {
        publicKey: { type: 'string' },
        assetCode: { type: 'string' },
        assetIssuer: { type: 'string' },
      },
      required: ['publicKey', 'assetCode', 'assetIssuer'],
    },
    response: {
      200: { type: 'string', description: 'Transaction XDR' },
      500: {
        type: 'object',
        properties: {
          code: { type: 'string' },
          message: { type: 'string' },
        },
      },
    },
    tags: ['Wallet'],
    summary: 'Build trustline transaction',
    description: 'Builds a trustline (change trust) transaction XDR for the given parameters.',
    operationId: 'buildTrustlineTransaction',
  },
}, async (request: FastifyRequest<{
  Body: { publicKey: string, assetCode: string, assetIssuer: string }
}>, reply: FastifyReply) => {
  try {
    const { publicKey, assetCode, assetIssuer } = request.body;
    const xdr = await buildTrustlineTransaction(publicKey, assetCode, assetIssuer);
    return xdr;
  } catch (error) {
    request.log.error(error);
    return reply.status(500).send({
      code: 'TRUSTLINE_ERROR',
      message: 'Failed to build trustline transaction',
    });
  }
});

// Print the OpenAPI spec after server is ready
server.ready(err => {
  if (err) throw err;
  console.log(server.swagger());
});

// Start the server
const start = async () => {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3001;
    await server.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
    console.log(`Swagger docs available at http://localhost:${port}/docs`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start(); 