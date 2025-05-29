import { z } from 'zod';

// Database Types
export interface UserWallet {
  id: number;
  twitter_id: string;
  stellar_public_key: string;
  created_at: string;
}

// API Request/Response Types
export const CreateWalletSchema = z.object({
  twitterId: z.string(),
});

export type CreateWalletRequest = z.infer<typeof CreateWalletSchema>;

export interface WalletResponse {
  publicKey: string;
  isNewWallet: boolean;
}

// Error Types
export interface ApiError {
  code: string;
  message: string;
} 