import { Test, TestingModule } from '@nestjs/testing';
import { ChainsController } from '../chains.controller';
import { ChainsService, Chain } from '../chains.service';
import { ConfigService } from '@nestjs/config';

describe('ChainsController', () => {
  let controller: ChainsController;
  let chainsService: ChainsService;

  const mockChains: Chain[] = [
    {
      id: '1',
      name: 'Ethereum Mainnet',
      rpcUrl: 'https://ethereum-rpc.publicnode.com',
      symbol: 'ETH',
      explorerUrl: 'https://etherscan.io',
    },
    {
      id: '137',
      name: 'Polygon Mainnet',
      rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
      symbol: 'MATIC',
      explorerUrl: 'https://polygonscan.com',
    },
  ];

  const mockChainsService = {
    getSupportedChains: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => defaultValue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChainsController],
      providers: [
        {
          provide: ChainsService,
          useValue: mockChainsService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    controller = module.get<ChainsController>(ChainsController);
    chainsService = module.get<ChainsService>(ChainsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getChains', () => {
    it('should return an array of supported chains', async () => {
      mockChainsService.getSupportedChains.mockResolvedValue(mockChains);

      const result = await controller.getChains();

      expect(result).toEqual(mockChains);
      expect(chainsService.getSupportedChains).toHaveBeenCalledTimes(1);
      expect(chainsService.getSupportedChains).toHaveBeenCalledWith();
    });

    it('should return empty array when no chains are available', async () => {
      mockChainsService.getSupportedChains.mockResolvedValue([]);

      const result = await controller.getChains();

      expect(result).toEqual([]);
      expect(chainsService.getSupportedChains).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors', async () => {
      const errorMessage = 'Service error';
      mockChainsService.getSupportedChains.mockRejectedValue(
        new Error(errorMessage),
      );

      await expect(controller.getChains()).rejects.toThrow(errorMessage);
      expect(chainsService.getSupportedChains).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration', () => {
    it('should return chains with proper structure', async () => {
      mockChainsService.getSupportedChains.mockResolvedValue(mockChains);

      const result = await controller.getChains();

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('rpcUrl');
      expect(result[0]).toHaveProperty('symbol');
      expect(result[0]).toHaveProperty('explorerUrl');
    });

    it('should return chains with valid URLs', async () => {
      mockChainsService.getSupportedChains.mockResolvedValue(mockChains);

      const result = await controller.getChains();

      result.forEach((chain) => {
        expect(chain.rpcUrl).toMatch(/^https?:\/\/.+/);
        expect(chain.explorerUrl).toMatch(/^https?:\/\/.+/);
      });
    });
  });
});