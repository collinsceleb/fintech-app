import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Exclude } from 'class-transformer';

@Entity('accounts')
export class Account {
  @ApiProperty({ example: '1', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'accounts_pkey',
  })
  id: string;

  @Column('decimal', { precision: 12, scale: 2, default: 0 })
  @Exclude()
  balance: number;

  @OneToOne(() => User, (user) => user.account)
  user: User;

  @ApiProperty({ example: '1234567890' })
  @Column({ name: 'account_number', unique: true })
  accountNumber: string;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
