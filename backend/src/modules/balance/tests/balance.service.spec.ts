import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { BalanceService } from '../balance.service';
import { TokenBalance } from '../../../entities/token-balance.entity';
import { ChainsService } from '../../chains/chains.service';

// Mock ethers
jest.mock('ethers', () => ({
  ethers: {
    JsonRpcProvider: jest.fn().mockImplementation(() => ({
      // Mock provider methods if needed
    })),
    Contract: jest.fn().mockImplementation(() => ({
      balanceOf: jest.fn(),
      decimals: jest.fn(),
      symbol: jest.fn(),
    })),
    formatUnits: jest.fn((value, decimals) => {
      // Simple mock implementation
      const divisor = Math.pow(10, decimals);
      return (parseInt(value) / divisor).toString();
    }),
  },
}));

describe('BalanceService', () => {
  let service: BalanceService;
  let repository: Repository<TokenBalance>;
  let chainsService: ChainsService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockChainsService = {
    getChainById: jest.fn(),
  };

  const mockChain = {
    id: '1',
    name: 'Ethereum Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    symbol: 'ETH',
    explorerUrl: 'https://etherscan.io',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BalanceService,
        {
          provide: getRepositoryToken(TokenBalance),
          useValue: mockRepository,
        },
        {
          provide: ChainsService,
          useValue: mockChainsService,
        },
      ],
    }).compile();

    service = module.get<BalanceService>(BalanceService);
    repository = module.get<Repository<TokenBalance>>(getRepositoryToken(TokenBalance));
    chainsService = module.get<ChainsService>(ChainsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getTokenBalance', () => {
    const walletAddress = '0x742d35Cc6634C0532925a3b8D6A8d9532b6BB11b';
    const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
    const chainId = '1';

    beforeEach(() => {
      mockChainsService.getChainById.mockReturnValue(mockChain);
    });

    it('should return token balance successfully', async () => {
      const { ethers } = require('ethers');
      const mockContract = {
        balanceOf: jest.fn().mockResolvedValue('1000000000'), // 1000 USDC (6 decimals)
        decimals: jest.fn().mockResolvedValue(6),
        symbol: jest.fn().mockResolvedValue('USDC'),
      };

      ethers.Contract.mockImplementation(() => mockContract);
      ethers.formatUnits.mockReturnValue('1000.0');

      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockResolvedValue({});

      const result = await service.getTokenBalance(walletAddress, tokenAddress, chainId);

      expect(result).toEqual({
        balance: '1000.0',
        symbol: 'USDC',
        decimals: 6,
      });

      expect(mockContract.balanceOf).toHaveBeenCalledWith(walletAddress);
      expect(mockContract.decimals).toHaveBeenCalled();
      expect(mockContract.symbol).toHaveBeenCalled();
      expect(ethers.formatUnits).toHaveBeenCalledWith('1000000000', 6);
    });

    it('should handle zero balance', async () => {
      const { ethers } = require('ethers');
      const mockContract = {
        balanceOf: jest.fn().mockResolvedValue('0'),
        decimals: jest.fn().mockResolvedValue(18),
        symbol: jest.fn().mockResolvedValue('TEST'),
      };

      ethers.Contract.mockImplementation(() => mockContract);
      ethers.formatUnits.mockReturnValue('0.0');

      const result = await service.getTokenBalance(walletAddress, tokenAddress, chainId);

      expect(result.balance).toBe('0.0');
      expect(result.symbol).toBe('TEST');
      expect(result.decimals).toBe(18);
    });

    it('should handle different token decimals', async () => {
      const { ethers } = require('ethers');
      const testCases = [
        { decimals: 6, rawBalance: '1000000', expectedBalance: '1.0' },
        { decimals: 18, rawBalance: '1000000000000000000', expectedBalance: '1.0' },
        { decimals: 8, rawBalance: '100000000', expectedBalance: '1.0' },
      ];

      for (const testCase of testCases) {
        const mockContract = {
          balanceOf: jest.fn().mockResolvedValue(testCase.rawBalance),
          decimals: jest.fn().mockResolvedValue(testCase.decimals),
          symbol: jest.fn().mockResolvedValue('TOKEN'),
        };

        ethers.Contract.mockImplementation(() => mockContract);
        ethers.formatUnits.mockReturnValue(testCase.expectedBalance);

        const result = await service.getTokenBalance(walletAddress, tokenAddress, chainId);

        expect(result.balance).toBe(testCase.expectedBalance);
        expect(result.decimals).toBe(testCase.decimals);
      }
    });

    it('should save balance to database asynchronously', async () => {
      const { ethers } = require('ethers');
      const mockContract = {
        balanceOf: jest.fn().mockResolvedValue('1000000'),
        decimals: jest.fn().mockResolvedValue(6),
        symbol: jest.fn().mockResolvedValue('USDC'),
      };

      ethers.Contract.mockImplementation(() => mockContract);
      ethers.formatUnits.mockReturnValue('1.0');

      const mockTokenBalance = {
        walletAddress,
        tokenAddress,
        tokenSymbol: 'USDC',
        balance: '1.0',
        chainId,
      };

      mockRepository.create.mockReturnValue(mockTokenBalance);
      mockRepository.save.mockResolvedValue(mockTokenBalance);

      await service.getTokenBalance(walletAddress, tokenAddress, chainId);

      // Give async operation time to complete
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockRepository.create).toHaveBeenCalledWith({
        walletAddress,
        tokenAddress,
        tokenSymbol: 'USDC',
        balance: '1.0',
        chainId,
      });
      expect(mockRepository.save).toHaveBeenCalledWith(mockTokenBalance);
    });

    it('should throw BadRequestException for unsupported chain', async () => {
      mockChainsService.getChainById.mockReturnValue(undefined);

      await expect(
        service.getTokenBalance(walletAddress, tokenAddress, '999'),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getTokenBalance(walletAddress, tokenAddress, '999'),
      ).rejects.toThrow('Unsupported chain ID: 999');
    });

    it('should handle contract interaction errors', async () => {
      const { ethers } = require('ethers');
      const mockContract = {
        balanceOf: jest.fn().mockRejectedValue(new Error('Contract call failed')),
        decimals: jest.fn().mockResolvedValue(18),
        symbol: jest.fn().mockResolvedValue('TOKEN'),
      };

      ethers.Contract.mockImplementation(() => mockContract);

      await expect(
        service.getTokenBalance(walletAddress, tokenAddress, chainId),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getTokenBalance(walletAddress, tokenAddress, chainId),
      ).rejects.toThrow('Failed to fetch token balance');
    });

    it('should handle network errors gracefully', async () => {
      const { ethers } = require('ethers');
      ethers.JsonRpcProvider.mockImplementation(() => {
        throw new Error('Network error');
      });

      await expect(
        service.getTokenBalance(walletAddress, tokenAddress, chainId),
      ).rejects.toThrow(BadRequestException);
    });

    it('should continue even if database save fails', async () => {
      const { ethers } = require('ethers');
      const mockContract = {
        balanceOf: jest.fn().mockResolvedValue('1000000'),
        decimals: jest.fn().mockResolvedValue(6),
        symbol: jest.fn().mockResolvedValue('USDC'),
      };

      // Reset the provider mock for this test
      ethers.JsonRpcProvider.mockImplementation(() => ({}));
      ethers.Contract.mockImplementation(() => mockContract);
      ethers.formatUnits.mockReturnValue('1.0');

      // Mock database save failure
      mockRepository.create.mockReturnValue({});
      mockRepository.save.mockRejectedValue(new Error('Database error'));

      // Should still return balance even if DB save fails
      const result = await service.getTokenBalance(walletAddress, tokenAddress, chainId);

      expect(result).toEqual({
        balance: '1.0',
        symbol: 'USDC',
        decimals: 6,
      });
    });
  });

  describe('different chains', () => {
    const walletAddress = '0x742d35Cc6634C0532925a3b8D6A8d9532b6BB11b';
    const tokenAddress = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';

    it('should work with Polygon chain', async () => {
      const polygonChain = { ...mockChain, id: '137', name: 'Polygon Mainnet' };
      mockChainsService.getChainById.mockReturnValue(polygonChain);

      const { ethers } = require('ethers');
      const mockContract = {
        balanceOf: jest.fn().mockResolvedValue('1000000'),
        decimals: jest.fn().mockResolvedValue(6),
        symbol: jest.fn().mockResolvedValue('USDC'),
      };

      ethers.JsonRpcProvider.mockImplementation(() => ({}));
      ethers.Contract.mockImplementation(() => mockContract);
      ethers.formatUnits.mockReturnValue('1.0');

      const result = await service.getTokenBalance(walletAddress, tokenAddress, '137');

      expect(result.symbol).toBe('USDC');
      expect(chainsService.getChainById).toHaveBeenCalledWith('137');
    });

    it('should work with Arbitrum chain', async () => {
      const arbitrumChain = { ...mockChain, id: '42161', name: 'Arbitrum One' };
      mockChainsService.getChainById.mockReturnValue(arbitrumChain);

      const { ethers } = require('ethers');
      const mockContract = {
        balanceOf: jest.fn().mockResolvedValue('1000000'),
        decimals: jest.fn().mockResolvedValue(6),
        symbol: jest.fn().mockResolvedValue('USDC'),
      };

      ethers.JsonRpcProvider.mockImplementation(() => ({}));
      ethers.Contract.mockImplementation(() => mockContract);
      ethers.formatUnits.mockReturnValue('1.0');

      const result = await service.getTokenBalance(walletAddress, tokenAddress, '42161');

      expect(result.symbol).toBe('USDC');
      expect(chainsService.getChainById).toHaveBeenCalledWith('42161');
    });
  });
});