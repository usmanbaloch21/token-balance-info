'use client';

import { useState } from 'react';
import { WalletConnection } from '../components/WalletConnection';
import { ChainSelector } from '../components/ChainSelector';
import { TokenBalanceChecker } from '../components/TokenBalanceChecker';
import { Chain } from '../types';

export default function Home() {
  const [selectedChain, setSelectedChain] = useState<Chain | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Token Balance Checker
          </h1>
          <p className="text-gray-600">
            Check ERC-20 token balances across multiple EVM chains
          </p>
        </div>

        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              1. Connect Your Wallet
            </h2>
            <WalletConnection />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              2. Select Chain
            </h2>
            <ChainSelector
              selectedChain={selectedChain}
              onChainSelect={setSelectedChain}
            />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              3. Check Token Balance
            </h2>
            <TokenBalanceChecker selectedChain={selectedChain} />
          </div>
        </div>

        <div className="mt-12 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Example Token Addresses
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-blue-800">Ethereum Mainnet:</p>
              <p className="text-blue-700 font-mono">
                USDC: 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
              </p>
              <p className="text-blue-700 font-mono">
                USDT: 0xdAC17F958D2ee523a2206206994597C13D831ec7
              </p>
            </div>
            <div>
              <p className="font-medium text-blue-800">Polygon Mainnet:</p>
              <p className="text-blue-700 font-mono">
                USDC: 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
              </p>
              <p className="text-blue-700 font-mono">
                USDT: 0xc2132D05D31c914a87C6611C10748AEb04B58e8F
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}