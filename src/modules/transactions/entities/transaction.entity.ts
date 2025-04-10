import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Account } from '../../accounts/entities/account.entity';
import { ApiProperty } from '@nestjs/swagger';
import { User } from "../../users/entities/user.entity";

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
  @ManyToOne(() => Account, (account) => account.sentTransactions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'senderAccountNumber',
    referencedColumnName: 'accountNumber',
  })
  senderAccount: Account;

  @ApiProperty({ example: '2', description: 'Receiver account' })
  @ManyToOne(() => Account, (account) => account.receivedTransactions, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({
    name: 'receiverAccountNumber',
    referencedColumnName: 'accountNumber',
  })
  receiverAccount: Account;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'initiatedByUserId' })
  initiatedBy: User;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
