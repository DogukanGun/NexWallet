# AutoPayer - Trustless P2P Bank Transfer Facilitator

## 🧠 Concept

AutoPayer is a smart contract-based escrow system that facilitates trustless peer-to-peer bank transfers. It bridges the gap between traditional fiat banking and cryptocurrency, enabling secure transactions without requiring trust between parties.

### How It Works

1. **Alice** (requester) wants to receive €150 fiat and locks 150 USDT in the smart contract
2. **Bob** (payer) accepts the request and sends €150 to Alice's bank account
3. Bob uploads proof of bank transfer (receipt/screenshot)
4. AI verifier validates the transfer proof
5. Smart contract releases the 150 USDT to Bob (minus platform fee)

## 🔐 Key Features

- **Trustless Escrow**: Smart contract holds funds until payment is verified
- **AI Verification**: OCR and ML-powered receipt validation
- **Dispute Resolution**: Built-in arbitration system
- **Multiple Currencies**: Support for EUR, USD, and other fiat currencies
- **Mobile-First**: Designed for smartphone-based transactions
- **Low Fees**: 1% platform fee (configurable)

## 🛠 Smart Contract Architecture

### Core Components

- **EscrowRequest**: Struct containing all transaction details
- **EscrowStatus**: Enum tracking request lifecycle
- **Verifiers**: Authorized addresses (AI/admin) that can validate receipts
- **Supported Tokens**: Whitelist of acceptable crypto tokens

### Key Functions

- `createEscrowRequest()`: Alice creates a new payment request
- `acceptEscrowRequest()`: Bob accepts and commits to the payment
- `submitReceipt()`: Bob submits proof of bank transfer
- `verifyAndRelease()`: AI/admin verifies and releases funds
- `raiseDispute()`: Either party can dispute the transaction
- `resolveDispute()`: Admin resolves disputes

## 🚀 Getting Started

### Prerequisites

- Node.js v18+ 
- npm or yarn
- Hardhat

### Installation

```bash
npm install
```

### Compilation

```bash
npx hardhat compile
```

### Testing

```bash
npx hardhat test
```

### Deployment

```bash
# Local deployment
npx hardhat run scripts/deploy.ts

# Testnet deployment (configure network in hardhat.config.ts)
npx hardhat run scripts/deploy.ts --network sepolia
```

## 📱 User Flow Example

### Alice's Perspective (Rent Requester)
```
1. Alice needs €150 rent payment from Bob
2. Alice has 150 USDT she's willing to give for the fiat
3. Alice creates escrow request with her IBAN details
4. Smart contract locks her 150 USDT
5. Alice shares request link with Bob
6. Once Bob pays and it's verified, Alice receives €150 in her bank
```

### Bob's Perspective (Rent Payer)
```
1. Bob receives Alice's payment request
2. Bob accepts the request (commits to paying)
3. Bob sends €150 to Alice's bank account
4. Bob uploads bank transfer receipt/screenshot
5. AI verifies the payment proof
6. Bob receives 150 USDT (minus 1% fee)
```

## 🔧 Configuration

### Supported Tokens
Add ERC20 tokens that can be used for escrow:
```solidity
autoPayer.addSupportedToken(USDT_ADDRESS);
autoPayer.addSupportedToken(USDC_ADDRESS);
```

### Verifiers
Add AI service or admin addresses that can verify receipts:
```solidity
autoPayer.addVerifier(AI_VERIFIER_ADDRESS);
```

### Platform Fee
Adjust the platform fee (in basis points):
```solidity
autoPayer.setPlatformFeeRate(100); // 1%
```

## 🌍 Real-World Use Cases

- **Student Housing**: Sublet rent payments between strangers
- **Freelancer Payments**: International client payments
- **Marketplace Transactions**: Craigslist, Facebook Marketplace sales
- **Crypto Trading**: P2P fiat-to-crypto exchange
- **Small Business**: Invoice payments for services

## 🔐 Security Features

- **ReentrancyGuard**: Prevents reentrancy attacks
- **Pausable**: Emergency pause mechanism
- **Access Control**: Role-based permissions
- **Expiration**: Requests auto-expire after 7 days
- **Dispute System**: Built-in arbitration for conflicts

## 🤖 AI Integration

The system integrates with AI services for receipt verification:

- **OCR Processing**: Extract text from bank receipts
- **Data Validation**: Match sender, amount, IBAN details
- **Fraud Detection**: Identify fake or manipulated images
- **Pattern Recognition**: Learn from verified transactions

## 📊 Contract Events

All major actions emit events for frontend integration:

```solidity
event EscrowCreated(uint256 indexed requestId, address indexed requester, ...);
event EscrowAccepted(uint256 indexed requestId, address indexed payer);
event ReceiptSubmitted(uint256 indexed requestId, bytes32 receiptHash, ...);
event EscrowCompleted(uint256 indexed requestId, ...);
event DisputeRaised(uint256 indexed requestId, address indexed disputeRaiser);
```

## 🔄 Request Lifecycle

```
Open → Accepted → ReceiptSubmitted → Completed
  ↓       ↓           ↓               ↓
Cancelled Expired   Disputed      Refunded
```

## 💰 Economics

- **Platform Fee**: 1% of escrowed amount (configurable)
- **Gas Optimization**: Via-IR compilation for lower gas costs
- **Fee Distribution**: Automatic transfer to fee recipient

## 🧪 Testing

The test suite covers:
- Escrow creation and acceptance
- Receipt submission and verification
- Dispute resolution mechanisms
- Fee calculations and distributions
- Access control and security

## 📈 Scalability

- **No Network Effects**: Works with just 2 parties
- **Embeddable**: Can be integrated into Telegram, WhatsApp
- **QR Codes**: Easy sharing of payment requests
- **Mobile-First**: Optimized for smartphone usage

## 🛡 Risk Mitigation

- **Time Limits**: Requests expire automatically
- **Dispute System**: Manual resolution for edge cases
- **Verifier Redundancy**: Multiple AI/admin verifiers
- **Emergency Controls**: Pause and emergency withdrawal

## 📝 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📞 Support

For questions or support, please reach out through:
- GitHub Issues
- Documentation: [Link to docs]
- Community Discord: [Link to Discord]
