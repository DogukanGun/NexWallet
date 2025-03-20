import { createAppKit } from "@reown/appkit/react";
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { AppKitNetwork, solana, solanaDevnet, solanaTestnet } from '@reown/appkit/networks'
import { PhantomWalletAdapter, SolflareWalletAdapter, TrustWalletAdapter } from "@solana/wallet-adapter-wallets";
import { HuobiWalletAdapter } from "@solana/wallet-adapter-wallets";

export const projectId = process.env.REOWN_KEY || "b56e18d47c72ab683b10814fe9495694"; // this is a public projectId only to use on localhost

export const networks = [solana, solanaTestnet, solanaDevnet]

// Setup solana adapter
const solanaAdapter = new SolanaAdapter({
  wallets: [
    new HuobiWalletAdapter(),
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new TrustWalletAdapter()
  ] as any // Type assertion to bypass type checking
})


// Create modal
const modal = createAppKit({
  adapters: [solanaAdapter],
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