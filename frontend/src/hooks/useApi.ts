import { useState, useCallback } from 'react';
import { Chain, TokenBalance } from '../types';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';

export const useApi = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChains = useCallback(async (): Promise<Chain[]> => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/chains`);
      if (!response.ok) {
        throw new Error('Failed to fetch chains');
      }
      const chains = await response.json();
      return chains;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTokenBalance = useCallback(async (
    walletAddress: string,
    tokenAddress: string,
    chainId: string
  ): Promise<TokenBalance> => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        walletAddress,
        tokenAddress,
        chainId,
      });
      
      const response = await fetch(`${API_BASE_URL}/api/balance?${params}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || 'Failed to fetch token balance');
      }
      
      const balance = await response.json();
      return balance;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    fetchChains,
    fetchTokenBalance,
    loading,
    error,
    clearError: () => setError(null),
  };
};