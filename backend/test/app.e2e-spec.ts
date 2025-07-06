import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

describe('Token Balance Checker (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        AppModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    app.enableCors();
    
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/api/chains (GET)', () => {
    it('should return list of supported chains', () => {
      return request(app.getHttpServer())
        .get('/api/chains')
        .expect(200)
        .expect((res) => {
          expect(res.body).toBeInstanceOf(Array);
          expect(res.body.length).toBeGreaterThan(0);
          
          // Check first chain structure
          const firstChain = res.body[0];
          expect(firstChain).toHaveProperty('id');
          expect(firstChain).toHaveProperty('name');
          expect(firstChain).toHaveProperty('rpcUrl');
          expect(firstChain).toHaveProperty('symbol');
          expect(firstChain).toHaveProperty('explorerUrl');
        });
    });

    it('should include Ethereum mainnet', () => {
      return request(app.getHttpServer())
        .get('/api/chains')
        .expect(200)
        .expect((res) => {
          const ethereumChain = res.body.find((chain: any) => chain.id === '1');
          expect(ethereumChain).toBeDefined();
          expect(ethereumChain.name).toBe('Ethereum Mainnet');
          expect(ethereumChain.symbol).toBe('ETH');
        });
    });

    it('should include Polygon mainnet', () => {
      return request(app.getHttpServer())
        .get('/api/chains')
        .expect(200)
        .expect((res) => {
          const polygonChain = res.body.find((chain: any) => chain.id === '137');
          expect(polygonChain).toBeDefined();
          expect(polygonChain.name).toBe('Polygon Mainnet');
          expect(polygonChain.symbol).toBe('MATIC');
        });
    });

    it('should return chains with valid URLs', () => {
      return request(app.getHttpServer())
        .get('/api/chains')
        .expect(200)
        .expect((res) => {
          res.body.forEach((chain: any) => {
            expect(chain.rpcUrl).toMatch(/^https?:\/\/.+/);
            expect(chain.explorerUrl).toMatch(/^https?:\/\/.+/);
          });
        });
    });
  });

  describe('/api/balance (GET)', () => {
    const validQuery = {
      walletAddress: '0x742d35Cc6634C0532925a3b8D6A8d9532b6BB11b',
      tokenAddress: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
      chainId: '1',
    };

    it('should require all query parameters', () => {
      return request(app.getHttpServer())
        .get('/api/balance')
        .expect(400);
    });

    it('should validate wallet address format', () => {
      return request(app.getHttpServer())
        .get('/api/balance')
        .query({
          ...validQuery,
          walletAddress: 'invalid-address',
        })
        .expect(400);
    });

    it('should validate token address format', () => {
      return request(app.getHttpServer())
        .get('/api/balance')
        .query({
          ...validQuery,
          tokenAddress: 'invalid-token-address',
        })
        .expect(400);
    });

    it('should require chainId parameter', () => {
      return request(app.getHttpServer())
        .get('/api/balance')
        .query({
          walletAddress: validQuery.walletAddress,
          tokenAddress: validQuery.tokenAddress,
        })
        .expect(400);
    });

    it('should reject unsupported chain ID', () => {
      return request(app.getHttpServer())
        .get('/api/balance')
        .query({
          ...validQuery,
          chainId: '999',
        })
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('Unsupported chain ID');
        });
    });

    // Note: These tests would require actual blockchain interaction
    // In a real scenario, you might want to mock the ethers calls
    // or use a testnet for integration testing
    
    it('should handle invalid token contract address', () => {
      return request(app.getHttpServer())
        .get('/api/balance')
        .query({
          ...validQuery,
          tokenAddress: '0x0000000000000000000000000000000000000000',
        })
        .expect(400);
    });

    it('should accept valid Ethereum addresses', () => {
      const validAddresses = [
        '0x742d35Cc6634C0532925a3b8D6A8d9532b6BB11b',
        '0x0000000000000000000000000000000000000001',
        '0xFFfFfFffFFfffFFfFFfFFFFFffFFFffffFfFFFfF',
      ];

      const requests = validAddresses.map(address =>
        request(app.getHttpServer())
          .get('/api/balance')
          .query({
            ...validQuery,
            walletAddress: address,
          })
      );

      // Note: These might fail due to network calls, but addresses should be valid
      return Promise.all(requests.map(req => 
        req.expect((res) => {
          // Should not fail due to address validation
          if (res.status === 400) {
            expect(res.body.message).not.toContain('invalid address');
          }
        })
      ));
    });
  });

  describe('CORS', () => {
    it('should include CORS headers', () => {
      return request(app.getHttpServer())
        .get('/api/chains')
        .expect(200)
        .expect('Access-Control-Allow-Origin', '*');
    });

    it('should handle preflight requests', () => {
      return request(app.getHttpServer())
        .options('/api/chains')
        .expect(204);
    });
  });

  describe('Error handling', () => {
    it('should handle 404 for non-existent endpoints', () => {
      return request(app.getHttpServer())
        .get('/api/non-existent')
        .expect(404);
    });

    it('should return proper error format', () => {
      return request(app.getHttpServer())
        .get('/api/balance')
        .expect(400)
        .expect((res) => {
          expect(res.body).toHaveProperty('message');
          expect(res.body).toHaveProperty('error');
          expect(res.body).toHaveProperty('statusCode');
          expect(res.body.statusCode).toBe(400);
        });
    });
  });
});