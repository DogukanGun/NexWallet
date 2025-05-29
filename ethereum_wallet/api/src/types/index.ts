export interface TransferTokenParams {
  token: string;
  amount: string;
  to: string;
}

export interface SwapTokenParams {
  fromToken: string;
  toToken: string;
  amount: string;
}

export interface AgentMessageRequest {
  message: string;
  userPk: string;
  params?: TransferTokenParams | SwapTokenParams;
}

export interface WalletRequest {
  userPk: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
} 