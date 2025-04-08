import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';

export type TransactionType = 'deposit' | 'withdrawal' | 'transfer';

@Entity('transactions')
export class Transaction {
  @ApiProperty({ example: '1', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'transactions_pkey',
  })
  id: string;

  @ApiProperty({ example: '100.00' })
  @Column('decimal', { precision: 12, scale: 2 })
  amount: number;

  @ApiProperty({ example: 'deposit' })
  @Column({ type: 'enum', enum: ['deposit', 'withdrawal', 'transfer'] })
  type: TransactionType;

  @ApiProperty({ example: '1', description: 'Sender account' })
  @ManyToOne(() => Account, (account) => account.id)
  senderAccount: Account;
  @ApiProperty({ example: '2', description: 'Receiver account' })
  @ManyToOne(() => Account, (account) => account.id)
  receiverAccount: Account;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
