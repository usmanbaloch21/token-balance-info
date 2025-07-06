export interface Chain {
  id: string;
  name: string;
  rpcUrl: string;
  symbol: string;
  explorerUrl: string;
}

export interface TokenBalance {
  balance: string;
  symbol: string;
  decimals: number;
}

export interface BalanceCheckResult extends TokenBalance {
  walletAddress: string;
  tokenAddress: string;
  chainId: string;
}