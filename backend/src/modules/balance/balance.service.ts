import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ethers } from 'ethers';
import { TokenBalance } from '../../entities/token-balance.entity';
import { ChainsService } from '../chains/chains.service';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

@Injectable()
export class BalanceService {
  private readonly logger = new Logger(BalanceService.name);

  constructor(
    @InjectRepository(TokenBalance)
    private tokenBalanceRepository: Repository<TokenBalance>,
    private chainsService: ChainsService,
  ) {}

  async getTokenBalance(
    walletAddress: string,
    tokenAddress: string,
    chainId: string,
  ): Promise<{ balance: string; symbol: string; decimals: number }> {
    this.logger.log(
      `Fetching balance for wallet: ${walletAddress}, token: ${tokenAddress}, chain: ${chainId}`,
    );

    const chain = this.chainsService.getChainById(chainId);
    if (!chain) {
      throw new BadRequestException(`Unsupported chain ID: ${chainId}`);
    }

    try {
      const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);

      const [balance, decimals, symbol] = await Promise.all([
        contract.balanceOf(walletAddress),
        contract.decimals(),
        contract.symbol(),
      ]);

      const formattedBalance = ethers.formatUnits(balance, decimals);

      this.saveBalanceAsync(
        walletAddress,
        tokenAddress,
        symbol,
        formattedBalance,
        chainId,
      );

      return {
        balance: formattedBalance,
        symbol,
        decimals: Number(decimals),
      };
    } catch (error) {
      this.logger.error(
        `Error fetching balance: ${error.message}`,
        error.stack,
      );
      throw new BadRequestException(
        `Failed to fetch token balance: ${error.message}`,
      );
    }
  }

  private async saveBalanceAsync(
    walletAddress: string,
    tokenAddress: string,
    symbol: string,
    balance: string,
    chainId: string,
  ): Promise<void> {
    try {
      const tokenBalance = this.tokenBalanceRepository.create({
        walletAddress,
        tokenAddress,
        tokenSymbol: symbol,
        balance,
        chainId,
      });

      await this.tokenBalanceRepository.save(tokenBalance);
      this.logger.log(
        `Balance saved for wallet: ${walletAddress}, token: ${tokenAddress}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to save balance: ${error.message}`,
        error.stack,
      );
    }
  }
}