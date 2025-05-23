import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { AppKitNetwork, solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import { HuobiWalletAdapter, PhantomWalletAdapter, TrustWalletAdapter } from "@solana/wallet-adapter-wallets";
import { mainnet, arbitrum, optimism, base, polygon, avalanche, opBNB } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { cookieStorage, createStorage } from '@wagmi/core'

export const projectId = process.env.REOWN_KEY || "b56e18d47c72ab683b10814fe9495694"; // this is a public projectId only to use on localhost

export const networks = [solana, solanaTestnet, solanaDevnet, mainnet, arbitrum, optimism, base, polygon, avalanche, opBNB]

// Setup solana adapter
const solanaAdapter = new SolanaAdapter({
  wallets: [
    new HuobiWalletAdapter(),
    new PhantomWalletAdapter(),
    new TrustWalletAdapter()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ] as any
})

// Configure WagmiAdapter without SSR so MetaMask is detected on the client
const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: false, // disable SSR to allow wallet injection detection
  projectId,
  networks
});

// Workaround for Brave browser: select MetaMask provider if multiple providers exist
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof window !== 'undefined' && (window.ethereum as any)?.providers) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const providers = (window.ethereum as any).providers;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.ethereum = providers.find((p: any) => p.isMetaMask) || providers[0];
}

// Create modal
const modal = createAppKit({
  adapters: [solanaAdapter, wagmiAdapter],
  networks: networks as unknown as [AppKitNetwork, ...AppKitNetwork[]],
  metadata: {
    name: 'Nexarb App',
    description: 'NexAI Agents Wallet Connection',
    url: "https://ai.nexarb.com",
    icons: ['https://avatars.githubusercontent.com/u/179229932?s=200&v=4']
  },
  projectId,
  themeMode: 'light',
  features: {
    analytics: true
  }
});

// Export the modal instance
export { modal };