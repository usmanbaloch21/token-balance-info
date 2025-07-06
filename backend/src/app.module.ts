import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoggerModule } from 'nestjs-pino';
import { ChainsModule } from './modules/chains/chains.module';
import { BalanceModule } from './modules/balance/balance.module';
import { TokenBalance } from './entities/token-balance.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport: {
          target: 'pino-pretty',
          options: {
            singleLine: true,
          },
        },
      },
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      entities: [TokenBalance],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ChainsModule,
    BalanceModule,
  ],
})
export class AppModule {}