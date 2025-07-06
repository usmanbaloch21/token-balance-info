'use client';

import { useState, useEffect } from 'react';
import { Chain } from '../types';
import { useApi } from '../hooks/useApi';

interface ChainSelectorProps {
  selectedChain: Chain | null;
  onChainSelect: (chain: Chain) => void;
}

export const ChainSelector = ({ selectedChain, onChainSelect }: ChainSelectorProps) => {
  const [chains, setChains] = useState<Chain[]>([]);
  const { fetchChains, loading, error } = useApi();

  useEffect(() => {
    const loadChains = async () => {
      try {
        const chainsData = await fetchChains();
        setChains(chainsData);
      } catch (err) {
        console.error('Failed to load chains:', err);
      }
    };

    loadChains();
  }, [fetchChains]);

  if (loading) {
    return (
      <div className="space-y-2">
        <label className="block text-base font-semibold text-gray-900">
          Select Chain
        </label>
        <div className="animate-pulse bg-gray-200 h-10 rounded-md"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-2">
        <label className="block text-base font-semibold text-gray-900">
          Select Chain
        </label>
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">Error loading chains: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-base font-semibold text-gray-900">
        Select Chain
      </label>
      <select
        value={selectedChain?.id || ''}
        onChange={(e) => {
          const chain = chains.find(c => c.id === e.target.value);
          if (chain) onChainSelect(chain);
        }}
        className="w-full px-4 py-3 text-base text-gray-900 bg-white border-2 border-gray-400 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600"
      >
        <option value="" className="text-gray-500">Select a chain...</option>
        {chains.map((chain) => (
          <option key={chain.id} value={chain.id} className="text-gray-900">
            {chain.name}
          </option>
        ))}
      </select>
    </div>
  );
};