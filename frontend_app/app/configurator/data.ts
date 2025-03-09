
export enum ChainId {
    BASE = "base",
    SOLANA = "solana",
    ETHEREUM = "ethereum",
    ARBITRUM = "arbitrum",
    POLYGON = "polygon",
    AVALANCHE = "avalanche",
    OPTIMISM = "optimism",
    STARKNET = "starknet",
    BNB = "bnb",
    SONIC_SVM = "sonic-svm",
}

export interface AppChain {
    id: ChainId;
    name: string;
    isEmbedded: boolean;
    disabled: boolean | undefined;
    icon: string;
}

export interface KnowledgeBase {
    id: string;
    name: string;
    disabled: boolean | undefined;
}