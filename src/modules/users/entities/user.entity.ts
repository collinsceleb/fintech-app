import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import * as argon2 from 'argon2';
import { Account } from '../../accounts/entities/account.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: '1', description: 'Unique identifier' })
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'users_pkey',
  })
  id: string;

  @ApiProperty({ example: 'user@mail.com', description: 'User email' })
  @Column('varchar', { length: 255, nullable: false, unique: true })
  email: string;

  @ApiProperty({ example: '12345678', description: 'User password' })
  @Column('varchar', { length: 255, nullable: false })
  @Exclude()
  password: string;

  @ApiProperty({ example: 'John' })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({ example: 0 })
  @Column({ name: 'tries', nullable: false, default: 0 })
  @Check('tries >= 0')
  failedAttempts: number;

  @ApiProperty({ example: false })
  @Column({ name: 'is_locked', default: false })
  isLocked: boolean;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @Column({ name: 'last_login', nullable: true })
  lastLogin: Date;

  @OneToOne(() => Account, (account) => account.user, {
    cascade: true,
    eager: true,
  })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  async hashPassword(): Promise<void> {
    this.password = await argon2.hash(this.password);
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    return await argon2.verify(this.password, plainPassword);
  }
}
