import { Schema, model, Document } from 'mongoose';

export enum EscrowStatus {
  OPEN = 'open',
  ACCEPTED = 'accepted',
  RECEIPT_SUBMITTED = 'receipt_submitted',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed'
}

export interface IEscrow extends Document {
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
  createdAt: Date;
  updatedAt: Date;
}

const escrowSchema = new Schema<IEscrow>({
  requestId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  contractAddress: {
    type: String,
    required: true,
    index: true
  },
  requesterAddress: {
    type: String,
    required: true,
    index: true
  },
  payerAddress: {
    type: String,
    index: true
  },
  tokenAddress: {
    type: String,
    required: true
  },
  tokenAmount: {
    type: String,
    required: true
  },
  tokenSymbol: {
    type: String,
    required: true,
    default: 'USDT'
  },
  fiatAmount: {
    type: Number,
    required: true
  },
  fiatCurrency: {
    type: String,
    required: true,
    default: 'EUR'
  },
  bankDetails: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  receiptRequirements: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: Object.values(EscrowStatus),
    default: EscrowStatus.OPEN,
    index: true
  },
  receiptHash: String,
  receiptFileUrl: String,
  receiptFileName: String,
  isDisputed: {
    type: Boolean,
    default: false,
    index: true
  },
  disputeReason: String,
  expiresAt: {
    type: Date,
    required: true,
    index: true
  },
  paidAt: Date,
  completedAt: Date,
  transactionHash: String,
  aiVerificationResult: {
    isVerified: Boolean,
    confidence: Number,
    reason: String,
    verifiedAt: Date
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
escrowSchema.index({ requesterAddress: 1, status: 1 });
escrowSchema.index({ payerAddress: 1, status: 1 });
escrowSchema.index({ status: 1, expiresAt: 1 });
escrowSchema.index({ createdAt: -1 });

// Virtual for time remaining
escrowSchema.virtual('timeRemaining').get(function() {
  if (this.status !== EscrowStatus.OPEN && this.status !== EscrowStatus.ACCEPTED) {
    return 0;
  }
  const now = new Date();
  const expires = this.expiresAt;
  return Math.max(0, expires.getTime() - now.getTime());
});

// Virtual for is expired
escrowSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt;
});

export const Escrow = model<IEscrow>('Escrow', escrowSchema); 