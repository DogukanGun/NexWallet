import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { AppKitNetwork, solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import { HuobiWalletAdapter, PhantomWalletAdapter, TrustWalletAdapter } from "@solana/wallet-adapter-wallets";
import { mainnet, arbitrum, optimism, base, polygon, avalanche, opBNB } from '@reown/appkit/networks'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { cookieStorage, createStorage, http } from '@wagmi/core'
import * as pino from 'pino'

export const projectId = process.env.REOWN_KEY || "b56e18d47c72ab683b10814fe9495694"; // this is a public projectId only to use on localhost

export const networks = [solana, solanaTestnet, solanaDevnet, mainnet, arbitrum, optimism, base, polygon, avalanche, opBNB]
<<<<<<< HEAD

// Configure pino logger with browser-specific settings
const logger = pino.default({
  browser: {
    asObject: true,
    write: {
      info: (...args) => console.log(...args),
      error: (...args) => console.error(...args)
    }
  },
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'error'
})
=======
>>>>>>> 285a13c0f83f4ebc09dc9c926b0dd7fe9057d65f

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
if (typeof window !== 'undefined' && (window.ethereum as any)?.providers) {
  const providers = (window.ethereum as any).providers;
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
export { modal, logger };