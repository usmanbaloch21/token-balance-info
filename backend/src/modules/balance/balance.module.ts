import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalanceController } from './balance.controller';
import { BalanceService } from './balance.service';
import { TokenBalance } from '../../entities/token-balance.entity';
import { ChainsModule } from '../chains/chains.module';

@Module({
  imports: [TypeOrmModule.forFeature([TokenBalance]), ChainsModule],
  controllers: [BalanceController],
  providers: [BalanceService],
})
export class BalanceModule {}