import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { BalanceService } from './balance.service';
import { GetBalanceDto } from './dto/get-balance.dto';

@Controller('api/balance')
export class BalanceController {
  constructor(private readonly balanceService: BalanceService) {}

  @Get()
  async getBalance(@Query() query: GetBalanceDto) {
    try {
      const balance = await this.balanceService.getTokenBalance(
        query.walletAddress,
        query.tokenAddress,
        query.chainId,
      );
      return balance;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}