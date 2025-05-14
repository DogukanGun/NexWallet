# Solana Fastify API

A standalone Fastify API server that replicates the mobile-solana endpoint without authentication requirements.

## Installation

1. Clone the repository
2. Navigate to the project directory:
   ```
   cd solana-fastify-api
   ```
3. Install dependencies:
   ```
   npm install
   ```
4. Create a `.env` file with the following content:
   ```
   PORT=3000
   OPENAI_API_KEY=your_openai_api_key_here
   SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
   ```
   Replace `your_openai_api_key_here` with your actual OpenAI API key.

## Running the Server

### Development Mode
```
npm run dev
```

### Production Mode
```
npm run build
npm start
```

## API Endpoints

### POST /api/mobile-solana

Process Solana blockchain queries without authentication.

**Request Body:**
```json
{
  "message": "What is my SOL balance?",
  "wallet": "YourSolanaWalletAddress"
}
```

**Response:**
```json
{
  "text": "Your SOL balance is X.XX"
}
```

Or if a transaction is created:

```json
{
  "text": "Transaction created successfully",
  "transaction": "transaction_data_here",
  "audio": null,
  "op": "solana"
}
```

## Error Handling

The API returns appropriate error messages with corresponding HTTP status codes:
- 400: Bad Request (missing or invalid parameters)
- 500: Internal Server Error (server-side issues) 