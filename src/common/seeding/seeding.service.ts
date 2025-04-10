import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Account } from '../../modules/accounts/entities/account.entity';
import { genCode } from '../utils/string';

@Injectable()
export class SeedingService {
  private readonly DUMMY_USER_EMAIL =
    this.configService.get<string>('DUMMY_USER_EMAIL');
  private readonly DUMMY_USER_PASSWORD = this.configService.get<string>(
    'DUMMY_USER_PASSWORD',
  );
  private readonly DUMMY_USER_FIRST_NAME = this.configService.get<string>(
    'DUMMY_USER_FIRST_NAME',
  );
  private readonly DUMMY_USER_LAST_NAME = this.configService.get<string>(
    'DUMMY_USER_LAST_NAME',
  );
  private readonly DUMMY_USER_ACCOUNT_BALANCE = this.configService.get<number>(
    'DUMMY_USER_ACCOUNT_BALANCE',
  );
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private readonly accountRepo: Repository<Account>,
    private readonly configService: ConfigService,
  ) {}
  async Initialize() {
    await this.createDummyUser();
  }
  private async createDummyUser(): Promise<User> {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { email: this.DUMMY_USER_EMAIL },
      });
      if (existingUser) {
        return existingUser;
      }
      const dummyUser = this.userRepository.create({
        email: this.DUMMY_USER_EMAIL,
        password: this.DUMMY_USER_PASSWORD,
        firstName: this.DUMMY_USER_FIRST_NAME,
        lastName: this.DUMMY_USER_LAST_NAME,
      });
      await dummyUser.hashPassword();
      await this.userRepository.save(dummyUser);
      await this.createAccount(dummyUser);
      const user = await this.userRepository.findOne({
        where: { id: dummyUser.id },
        relations: ['account'],
      });
      return user;
    } catch (error) {
      console.error('Error creating SuperAdmin role:', error);
      return null;
    }
  }
  async createAccount(user: User): Promise<Account> {
    const maxAttempts = 5;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const account = this.accountRepo.create({
        user,
        balance: this.DUMMY_USER_ACCOUNT_BALANCE,
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
}
