# Ethereum Wallet API

This API provides endpoints for managing Ethereum wallets and interacting with an AI agent for natural language processing of wallet operations.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory with the following variables:
```env
WALLET_FACTORY_ADDRESS=your_factory_contract_address
RPC_URL=your_rpc_url
PRIVATE_KEY=your_private_key
OPENAI_API_KEY=your_openai_api_key
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Start the server:
```bash
npm start
```

For development with hot reload:
```bash
npm run dev
```

## API Documentation

The API documentation is available at `http://localhost:8005/docs` when the server is running.

### Available Endpoints

#### Wallet Management

- `POST /api/wallet/create`
  - Create a new wallet for a user
  - Body: `{ "userPk": "string" }`

- `GET /api/wallet/get`
  - Get a user's wallet address
  - Query: `?userPk=string`

- `POST /api/wallet/transfer`
  - Transfer tokens from a wallet
  - Body: `{ "userPk": "string", "token": "string", "amount": "string", "to": "string" }`

- `POST /api/wallet/swap`
  - Swap tokens in a wallet
  - Body: `{ "userPk": "string", "fromToken": "string", "toToken": "string", "amount": "string" }`

#### AI Agent

- `POST /api/wallet/agent`
  - Process natural language commands for wallet operations
  - Body: `{ "message": "string", "userPk": "string", "params": object }`

## Error Handling

All endpoints return responses in the following format:

```typescript
{
  success: boolean;
  data: T | null;
  error?: string;
}
```

## Development

The project uses TypeScript and Fastify. The main components are:

- `src/index.ts`: Server setup and configuration
- `src/routes/wallet.ts`: API route handlers
- `src/types/index.ts`: TypeScript type definitions 