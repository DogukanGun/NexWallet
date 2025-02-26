
export enum ChainId {
    BASE = "base",
    SOLANA = "solana",
    ETHEREUM = "ethereum",
    ARBITRUM = "arbitrum",
    POLYGON = "polygon",
    AVALANCHE = "avalanche",
    METAVERS = "metavers"
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