'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { Chain, TokenBalance } from '../types';
import { useApi } from '../hooks/useApi';

interface TokenBalanceCheckerProps {
  selectedChain: Chain | null;
}

export const TokenBalanceChecker = ({ selectedChain }: TokenBalanceCheckerProps) => {
  const { address } = useAccount();
  const [tokenAddress, setTokenAddress] = useState('');
  const [balance, setBalance] = useState<TokenBalance | null>(null);
  const { fetchTokenBalance, loading, error, clearError } = useApi();

  const handleCheckBalance = async () => {
    if (!address || !tokenAddress || !selectedChain) return;

    clearError();
    setBalance(null);

    try {
      const balanceData = await fetchTokenBalance(address, tokenAddress, selectedChain.id);
      setBalance(balanceData);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const isValidAddress = (addr: string) => {
    return /^0x[a-fA-F0-9]{40}$/.test(addr);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <label className="block text-base font-semibold text-gray-900 mb-2">
            Token Contract Address
          </label>
          <input
            type="text"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            placeholder="0x..."
            className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 placeholder-gray-500"
          />
          {tokenAddress && !isValidAddress(tokenAddress) && (
            <p className="text-sm text-red-600 mt-1">
              Please enter a valid Ethereum address
            </p>
          )}
        </div>

        <button
          onClick={handleCheckBalance}
          disabled={!address || !tokenAddress || !selectedChain || !isValidAddress(tokenAddress) || loading}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Checking Balance...' : 'Check Balance'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {balance && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">Token Balance</h3>
          <div className="space-y-1">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Symbol:</span> {balance.symbol}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Balance:</span> {balance.balance}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Decimals:</span> {balance.decimals}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};