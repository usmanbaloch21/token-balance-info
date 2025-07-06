import { createWeb3Modal } from '@web3modal/wagmi'
import { defaultWagmiConfig } from '@web3modal/wagmi'
import { mainnet, sepolia, polygon, arbitrum, optimism } from '@wagmi/core/chains'

export const projectId = process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'demo-project-id'

export const chains = [mainnet, sepolia, polygon, arbitrum, optimism] as const

export const config = defaultWagmiConfig({
  chains,
  projectId,
  metadata: {
    name: 'Token Balance Checker',
    description: 'Check ERC-20 token balances across multiple chains',
    url: 'http://localhost:3000',
    icons: ['https://avatars.githubusercontent.com/u/37784886'],
  },
  ssr: true,
})

// Initialize modal only on client side
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig: config,
    projectId,
    enableAnalytics: false,
  });
}