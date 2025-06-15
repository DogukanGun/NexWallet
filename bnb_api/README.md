# AutoPayer API

A comprehensive Fastify-based API for the AutoPayer P2P escrow system with AI-powered receipt verification.

## Features

- 🔐 **Smart Contract Integration**: Direct interaction with AutoPayer smart contracts
- 🤖 **AI Verification**: OpenAI-powered receipt verification using GPT-4 Vision
- 📁 **IPFS File Storage**: Decentralized file storage for receipts
- 📊 **MongoDB Database**: Persistent data storage with optimized queries
- 🚀 **High Performance**: Built with Fastify for maximum speed
- 📚 **API Documentation**: Auto-generated Swagger documentation
- 🔍 **Health Monitoring**: Comprehensive health checks and monitoring

## Installation

1. **Clone and Install Dependencies**
```bash
cd bnb_api
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/autopayer

# Blockchain
BNB_RPC_URL=https://bsc-dataseed.binance.org/
AUTOPAYER_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_private_key_here

# AI Services
OPENAI_API_KEY=your_openai_api_key_here

# IPFS
IPFS_API_URL=http://localhost:5001
IPFS_GATEWAY_URL=https://ipfs.io/ipfs/
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Build for Production**
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- `GET /api/health` - Basic health check
- `GET /api/health/detailed` - Detailed system health

### Escrow Management
- `GET /api/escrow` - List all escrows (with filters)
- `GET /api/escrow/active` - Get active/open escrows
- `GET /api/escrow/:id` - Get specific escrow by ID
- `POST /api/escrow` - Create new escrow request
- `POST /api/escrow/:id/accept` - Accept escrow request
- `POST /api/escrow/:id/submit-proof` - Submit payment proof
- `POST /api/escrow/:id/cancel` - Cancel escrow (requester only)
- `POST /api/escrow/:id/dispute` - Raise dispute

### User Operations
- `GET /api/escrow/user/:address/requests` - Get user's escrow requests
- `GET /api/escrow/user/:address/payments` - Get user's payments

### File Management
- `POST /api/files/upload-receipt` - Upload receipt file to IPFS
- `GET /api/files/info/:hash` - Get file info from IPFS hash

### AI Verification
- `POST /api/ai/verify/:escrowId` - Trigger manual AI verification
- `GET /api/ai/status/:escrowId` - Get AI verification status

## Data Models

### Escrow Request
```typescript
{
  requestId: string;
  contractAddress: string;
  requesterAddress: string;
  payerAddress?: string;
  tokenAddress: string;
  tokenAmount: string;
  tokenSymbol: string;
  fiatAmount: number;
  fiatCurrency: string;
  bankDetails: string;
  description: string;
  receiptRequirements: string;
  status: EscrowStatus;
  receiptHash?: string;
  receiptFileUrl?: string;
  receiptFileName?: string;
  isDisputed: boolean;
  disputeReason?: string;
  expiresAt: Date;
  paidAt?: Date;
  completedAt?: Date;
  transactionHash?: string;
  aiVerificationResult?: {
    isVerified: boolean;
    confidence: number;
    reason: string;
    verifiedAt: Date;
  };
}
```

### Escrow Status
- `open` - Request created, waiting for payer
- `accepted` - Payer accepted, waiting for bank transfer
- `receipt_submitted` - Receipt submitted, waiting for verification
- `completed` - Verified and funds released
- `cancelled` - Cancelled by requester
- `refunded` - Dispute resolved - refunded to requester
- `disputed` - Under dispute resolution

## Example Usage

### 1. Create Escrow Request
```bash
curl -X POST http://localhost:3001/api/escrow \
  -H "Content-Type: application/json" \
  -d '{
    "requesterAddress": "0x123...",
    "tokenAddress": "0x55d398326f99059fF775485246999027B3197955",
    "tokenAmount": "150",
    "fiatAmount": 150,
    "fiatCurrency": "EUR",
    "bankDetails": "DE89370400440532013000",
    "description": "Rent payment",
    "receiptRequirements": "Bank transfer screenshot showing €150 transfer, recipient IBAN, date visible"
  }'
```

### 2. Upload Receipt File
```bash
curl -X POST http://localhost:3001/api/files/upload-receipt \
  -F "file=@receipt.jpg"
```

### 3. Submit Payment Proof
```bash
curl -X POST http://localhost:3001/api/escrow/req_001/submit-proof \
  -H "Content-Type: application/json" \
  -d '{
    "receiptFileUrl": "https://ipfs.io/ipfs/QmHash...",
    "receiptFileName": "bank_receipt.jpg"
  }'
```

### 4. Get User's Requests
```bash
curl http://localhost:3001/api/escrow/user/0x123.../requests
```

## AI Verification Process

1. **Receipt Upload**: User uploads receipt file (JPG, PNG, PDF)
2. **IPFS Storage**: File stored on IPFS for decentralized access
3. **AI Analysis**: OpenAI GPT-4 Vision analyzes receipt against requirements
4. **Verification Logic**:
   - **High Confidence (≥0.8)**: Auto-approve and release funds
   - **Low Confidence (<0.5)**: Auto-reject and refund
   - **Medium Confidence (0.5-0.8)**: Manual review required
5. **Blockchain Update**: Result submitted to smart contract

## Smart Contract Integration

The API integrates with the AutoPayer smart contract deployed on BNB Chain:

- **Creates** escrow requests on-chain
- **Monitors** contract events
- **Submits** AI verification results
- **Handles** fund releases and disputes

## Development

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

### API Documentation
Visit `http://localhost:3001/docs` for interactive Swagger documentation.

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │───▶│   Fastify API   │───▶│  Smart Contract │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │    MongoDB      │
                       └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │  AI Verification│
                       │   (OpenAI)      │
                       └─────────────────┘
                               │
                               ▼
                       ┌─────────────────┐
                       │  IPFS Storage   │
                       └─────────────────┘
```

## Production Deployment

1. **Database**: Set up MongoDB cluster
2. **Environment**: Configure production environment variables
3. **IPFS**: Set up IPFS node or use service like Pinata
4. **SSL**: Configure HTTPS with certificates
5. **Monitoring**: Set up logging and monitoring
6. **Rate Limiting**: Configure rate limits for production

## Security

- 🔐 Environment variables for sensitive data
- 🛡️ Input validation and sanitization
- 🚫 Rate limiting to prevent abuse
- 📝 Comprehensive logging for audit trails
- 🔍 File type validation for uploads
- 💰 Smart contract interaction security

## License

MIT License - see LICENSE file for details. 