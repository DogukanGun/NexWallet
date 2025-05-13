
export interface Agent {
    id: string
    name: string
    description: string
    poweredBy: string
    isWalletRequired: boolean,
}

// Add new interface for upcoming features
export interface UpcomingFeature {
    id: string;
    name: string;
    description: string;
    icon: string;
    eta: string; // Estimated time of arrival
    isBeta: boolean;
}