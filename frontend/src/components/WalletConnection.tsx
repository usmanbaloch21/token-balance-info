'use client';

import { useAccount, useDisconnect } from 'wagmi';
import { useEffect, useState } from 'react';

export const WalletConnection = () => {
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!mounted) {
    return (
      <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-gray-600">Connect your wallet to get started</p>
        <div className="w-32 h-10 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex-1">
          <p className="text-sm text-green-600 font-medium">Wallet Connected</p>
          <p className="text-sm text-green-700 font-mono">{formatAddress(address)}</p>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 text-sm bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-gray-50 border border-gray-200 rounded-lg">
      <p className="text-gray-600">Connect your wallet to get started</p>
      <w3m-button />
    </div>
  );
};