export interface StakingPool {
  id: string;
  totalShares: string;
  totalStaked: string;
  delegators?: {
    shares: string;
    stakedAmount: string;
  }[];
}

export interface Delegator {
  id: string;
  address: string;
  totalShares: string;
  totalStaked: string;
}

export interface Operator {
  id: string;
  address: string;
  totalDelegated: string;
  delegatorCount: string;
} 