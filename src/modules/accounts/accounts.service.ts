import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { genCode } from '../../common/utils/string';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
  ) {}

  async createAccount(user: User): Promise<Account> {
    const maxAttempts = 5;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const account = this.accountRepo.create({
        user,
        balance: 0.0,
        accountNumber: this.generateAccountNumber(),
      });

      try {
        return await this.accountRepo.save(account);
      } catch (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          attempt++;
          continue;
        }
        throw new InternalServerErrorException('Error creating account');
      }
    }

    throw new InternalServerErrorException(
      'Failed to generate unique account number',
    );
  }

  private generateAccountNumber(): string {
    return 'AC' + genCode(10);
  }

  async findByUser(user: User): Promise<Account> {
    return await this.accountRepo.findOne({ where: { user } });
  }
  create(createAccountDto: CreateAccountDto) {
    return 'This action adds a new account';
  }

  findAll() {
    return `This action returns all accounts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
