import { Module } from '@nestjs/common';
import { ChainsController } from './chains.controller';
import { ChainsService } from './chains.service';

@Module({
  controllers: [ChainsController],
  providers: [ChainsService],
  exports: [ChainsService],
})
export class ChainsModule {}