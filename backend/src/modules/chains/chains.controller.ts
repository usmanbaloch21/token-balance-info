import { Controller, Get } from '@nestjs/common';
import { ChainsService, Chain } from './chains.service';

@Controller('api/chains')
export class ChainsController {
  constructor(private readonly chainsService: ChainsService) {}

  @Get()
  async getChains(): Promise<Chain[]> {
    return this.chainsService.getSupportedChains();
  }
}