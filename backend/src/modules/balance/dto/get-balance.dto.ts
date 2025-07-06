import { IsString, IsEthereumAddress, IsNotEmpty } from 'class-validator';

export class GetBalanceDto {
  @IsEthereumAddress()
  @IsNotEmpty()
  walletAddress: string;

  @IsEthereumAddress()
  @IsNotEmpty()
  tokenAddress: string;

  @IsString()
  @IsNotEmpty()
  chainId: string;
}