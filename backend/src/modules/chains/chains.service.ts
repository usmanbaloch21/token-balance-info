import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface Chain {
  id: string;
  name: string;
  rpcUrl: string;
  symbol: string;
  explorerUrl: string;
}

@Injectable()
export class ChainsService {
  private readonly logger = new Logger(ChainsService.name);

  constructor(private configService: ConfigService) {}
  
  private getSupportedChainsConfig(): Chain[] {
    return [
      {
        id: '1',
        name: 'Ethereum Mainnet',
        rpcUrl: this.configService.get('ETHEREUM_RPC_URL', 'https://ethereum-rpc.publicnode.com'),
        symbol: 'ETH',
        explorerUrl: 'https://etherscan.io',
      },
      {
        id: '11155111',
        name: 'Sepolia Testnet',
        rpcUrl: this.configService.get('SEPOLIA_RPC_URL', 'https://ethereum-sepolia-rpc.publicnode.com'),
        symbol: 'SepoliaETH',
        explorerUrl: 'https://sepolia.etherscan.io',
      },
      {
        id: '137',
        name: 'Polygon Mainnet',
        rpcUrl: this.configService.get('POLYGON_RPC_URL', 'https://polygon-bor-rpc.publicnode.com'),
        symbol: 'MATIC',
        explorerUrl: 'https://polygonscan.com',
      },
      {
        id: '42161',
        name: 'Arbitrum One',
        rpcUrl: this.configService.get('ARBITRUM_RPC_URL', 'https://arbitrum-one-rpc.publicnode.com'),
        symbol: 'ARB',
        explorerUrl: 'https://arbiscan.io',
      },
      {
        id: '10',
        name: 'Optimism',
        rpcUrl: this.configService.get('OPTIMISM_RPC_URL', 'https://optimism-rpc.publicnode.com'),
        symbol: 'OP',
        explorerUrl: 'https://optimistic.etherscan.io',
      },
    ];
  }

  async getSupportedChains(): Promise<Chain[]> {
    this.logger.log('Fetching supported chains');
    return this.getSupportedChainsConfig();
  }

  getChainById(chainId: string): Chain | undefined {
    return this.getSupportedChainsConfig().find((chain) => chain.id === chainId);
  }
}