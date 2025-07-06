import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { BalanceController } from '../balance.controller';
import { BalanceService } from '../balance.service';
import { GetBalanceDto } from '../dto/get-balance.dto';

describe('BalanceController', () => {
  let controller: BalanceController;
  let balanceService: BalanceService;

  const mockBalanceService = {
    getTokenBalance: jest.fn(),
  };

  const mockBalanceResponse = {
    balance: '1000.123456',
    symbol: 'USDC',
    decimals: 6,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BalanceController],
      providers: [
        {
          provide: BalanceService,
          useValue: mockBalanceService,
        },
      ],
    }).compile();

    controller = module.get<BalanceController>(BalanceController);
    balanceService = module.get<BalanceService>(BalanceService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getBalance', () => {
    const validQuery: GetBalanceDto = {
      walletAddress: '0x742d35Cc6634C0532925a3b8D6A8d9532b6BB11b',
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      chainId: '1',
    };

    it('should return token balance successfully', async () => {
      mockBalanceService.getTokenBalance.mockResolvedValue(mockBalanceResponse);

      const result = await controller.getBalance(validQuery);

      expect(result).toEqual(mockBalanceResponse);
      expect(balanceService.getTokenBalance).toHaveBeenCalledWith(
        validQuery.walletAddress,
        validQuery.tokenAddress,
        validQuery.chainId,
      );
      expect(balanceService.getTokenBalance).toHaveBeenCalledTimes(1);
    });

    it('should handle different chain IDs', async () => {
      const polygonQuery = { ...validQuery, chainId: '137' };
      mockBalanceService.getTokenBalance.mockResolvedValue(mockBalanceResponse);

      const result = await controller.getBalance(polygonQuery);

      expect(result).toEqual(mockBalanceResponse);
      expect(balanceService.getTokenBalance).toHaveBeenCalledWith(
        polygonQuery.walletAddress,
        polygonQuery.tokenAddress,
        polygonQuery.chainId,
      );
    });

    it('should handle different token addresses', async () => {
      const usdtQuery = {
        ...validQuery,
        tokenAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      };
      const usdtResponse = { ...mockBalanceResponse, symbol: 'USDT' };
      mockBalanceService.getTokenBalance.mockResolvedValue(usdtResponse);

      const result = await controller.getBalance(usdtQuery);

      expect(result).toEqual(usdtResponse);
      expect(balanceService.getTokenBalance).toHaveBeenCalledWith(
        usdtQuery.walletAddress,
        usdtQuery.tokenAddress,
        usdtQuery.chainId,
      );
    });

    it('should handle zero balance', async () => {
      const zeroBalanceResponse = { ...mockBalanceResponse, balance: '0' };
      mockBalanceService.getTokenBalance.mockResolvedValue(zeroBalanceResponse);

      const result = await controller.getBalance(validQuery);

      expect(result).toEqual(zeroBalanceResponse);
      expect(result.balance).toBe('0');
    });

    it('should handle large balance numbers', async () => {
      const largeBalanceResponse = {
        ...mockBalanceResponse,
        balance: '999999999999.123456789',
      };
      mockBalanceService.getTokenBalance.mockResolvedValue(largeBalanceResponse);

      const result = await controller.getBalance(validQuery);

      expect(result).toEqual(largeBalanceResponse);
      expect(result.balance).toBe('999999999999.123456789');
    });
  });

  describe('error handling', () => {
    const validQuery: GetBalanceDto = {
      walletAddress: '0x742d35Cc6634C0532925a3b8D6A8d9532b6BB11b',
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      chainId: '1',
    };

    it('should throw BadRequestException when service throws error', async () => {
      const errorMessage = 'Invalid token address';
      mockBalanceService.getTokenBalance.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getBalance(validQuery)).rejects.toThrow(
        BadRequestException,
      );
      await expect(controller.getBalance(validQuery)).rejects.toThrow(
        errorMessage,
      );
    });

    it('should handle unsupported chain error', async () => {
      const errorMessage = 'Unsupported chain ID: 999';
      mockBalanceService.getTokenBalance.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getBalance(validQuery)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should handle network errors', async () => {
      const errorMessage = 'Network error: Unable to connect to RPC';
      mockBalanceService.getTokenBalance.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getBalance(validQuery)).rejects.toThrow(
        errorMessage,
      );
    });

    it('should handle invalid contract address errors', async () => {
      const errorMessage = 'Contract not found or invalid';
      mockBalanceService.getTokenBalance.mockRejectedValue(new Error(errorMessage));

      await expect(controller.getBalance(validQuery)).rejects.toThrow(
        errorMessage,
      );
    });
  });

  describe('query parameter validation', () => {
    it('should handle various valid wallet addresses', async () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b8D6A8d9532b6BB11b',
        '0x0000000000000000000000000000000000000000',
        '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
      ];

      mockBalanceService.getTokenBalance.mockResolvedValue(mockBalanceResponse);

      for (const address of validAddresses) {
        const query = {
          walletAddress: address,
          tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          chainId: '1',
        };

        const result = await controller.getBalance(query);
        expect(result).toEqual(mockBalanceResponse);
      }
    });

    it('should handle various valid token addresses', async () => {
      const validTokens = [
        '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
      ];

      mockBalanceService.getTokenBalance.mockResolvedValue(mockBalanceResponse);

      for (const tokenAddress of validTokens) {
        const query = {
          walletAddress: '0x742d35Cc6634C0532925a3b8D6A8d9532b6BB11b',
          tokenAddress,
          chainId: '1',
        };

        const result = await controller.getBalance(query);
        expect(result).toEqual(mockBalanceResponse);
      }
    });

    it('should handle various valid chain IDs', async () => {
      const validChains = ['1', '137', '42161', '10', '11155111'];

      mockBalanceService.getTokenBalance.mockResolvedValue(mockBalanceResponse);

      for (const chainId of validChains) {
        const query = {
          walletAddress: '0x742d35Cc6634C0532925a3b8D6A8d9532b6BB11b',
          tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
          chainId,
        };

        const result = await controller.getBalance(query);
        expect(result).toEqual(mockBalanceResponse);
      }
    });
  });
});