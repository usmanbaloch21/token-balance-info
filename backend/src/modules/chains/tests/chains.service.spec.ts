import { Test, TestingModule } from '@nestjs/testing';
import { ChainsService, Chain } from '../chains.service';
import { ConfigService } from '@nestjs/config';

describe('ChainsService', () => {
  let service: ChainsService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const envVars = {
        ETHEREUM_RPC_URL: 'https://custom-ethereum-rpc.com',
        POLYGON_RPC_URL: 'https://custom-polygon-rpc.com',
      };
      return envVars[key] || defaultValue;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChainsService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<ChainsService>(ChainsService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSupportedChains', () => {
    it('should return an array of supported chains', async () => {
      const chains = await service.getSupportedChains();

      expect(chains).toBeInstanceOf(Array);
      expect(chains.length).toBeGreaterThan(0);
    });

    it('should return chains with required properties', async () => {
      const chains = await service.getSupportedChains();

      chains.forEach((chain) => {
        expect(chain).toHaveProperty('id');
        expect(chain).toHaveProperty('name');
        expect(chain).toHaveProperty('rpcUrl');
        expect(chain).toHaveProperty('symbol');
        expect(chain).toHaveProperty('explorerUrl');
        expect(typeof chain.id).toBe('string');
        expect(typeof chain.name).toBe('string');
        expect(typeof chain.rpcUrl).toBe('string');
        expect(typeof chain.symbol).toBe('string');
        expect(typeof chain.explorerUrl).toBe('string');
      });
    });

    it('should use environment variables when available', async () => {
      const chains = await service.getSupportedChains();
      
      const ethereumChain = chains.find(chain => chain.id === '1');
      const polygonChain = chains.find(chain => chain.id === '137');

      expect(ethereumChain?.rpcUrl).toBe('https://custom-ethereum-rpc.com');
      expect(polygonChain?.rpcUrl).toBe('https://custom-polygon-rpc.com');
    });

    it('should use default RPC URLs when environment variables are not set', async () => {
      mockConfigService.get.mockImplementation((key: string, defaultValue?: string) => defaultValue);

      const chains = await service.getSupportedChains();
      
      const ethereumChain = chains.find(chain => chain.id === '1');
      expect(ethereumChain?.rpcUrl).toBe('https://ethereum-rpc.publicnode.com');
    });

    it('should include all major chains', async () => {
      const chains = await service.getSupportedChains();
      const chainIds = chains.map(chain => chain.id);

      expect(chainIds).toContain('1'); // Ethereum
      expect(chainIds).toContain('137'); // Polygon
      expect(chainIds).toContain('42161'); // Arbitrum
      expect(chainIds).toContain('10'); // Optimism
      expect(chainIds).toContain('11155111'); // Sepolia
    });
  });

  describe('getChainById', () => {
    it('should return the correct chain by ID', () => {
      const chain = service.getChainById('1');

      expect(chain).toBeDefined();
      expect(chain?.id).toBe('1');
      expect(chain?.name).toBe('Ethereum Mainnet');
      expect(chain?.symbol).toBe('ETH');
    });

    it('should return undefined for non-existent chain ID', () => {
      const chain = service.getChainById('999');

      expect(chain).toBeUndefined();
    });

    it('should handle string chain IDs correctly', () => {
      const polygonChain = service.getChainById('137');
      const arbitrumChain = service.getChainById('42161');

      expect(polygonChain?.name).toBe('Polygon Mainnet');
      expect(arbitrumChain?.name).toBe('Arbitrum One');
    });

    it('should return chains with valid URLs', () => {
      const chains = ['1', '137', '42161', '10', '11155111'];
      
      chains.forEach(chainId => {
        const chain = service.getChainById(chainId);
        expect(chain?.rpcUrl).toMatch(/^https?:\/\/.+/);
        expect(chain?.explorerUrl).toMatch(/^https?:\/\/.+/);
      });
    });
  });
});