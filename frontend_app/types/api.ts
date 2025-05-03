export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  error?: string;
}

export interface CharacterData {
  id: string;
  name: string;
  description: string;
  // Add other character properties
}

export interface MessageData {
  role: string;
  content: string;
  timestamp?: number;
}

export interface BnbData {
  address: string;
  balance: string;
  transactions: Array<{
    hash: string;
    value: string;
    timestamp: number;
  }>;
} 