import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('token_balances')
export class TokenBalance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  walletAddress: string;

  @Column()
  tokenAddress: string;

  @Column()
  tokenSymbol: string;

  @Column()
  balance: string;

  @Column()
  chainId: string;

  @CreateDateColumn()
  createdAt: Date;
}