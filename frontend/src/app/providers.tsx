'use client';

import { WagmiProvider } from 'wagmi';
import { config } from '../config/wagmi';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      {children}
    </WagmiProvider>
  );
}