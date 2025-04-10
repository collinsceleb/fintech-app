import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transaction } from './entities/transaction.entity';
import { Account } from '../accounts/entities/account.entity';
import { Request } from 'express';
import { User } from '../users/entities/user.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
    private readonly datasource: DataSource,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  async transferFunds(
    request: Request,
    transferDto: CreateTransactionDto,
  ): Promise<{ transaction: Transaction; message: string }> {
    const queryRunner = this.datasource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const { senderAccountNumber, receiverAccountNumber, amount } =
        transferDto;
      const user = request.user as User;
      const existingUser = await this.userRepository.findOne({
        where: { id: user.id },
      });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
      if (senderAccountNumber === receiverAccountNumber) {
        throw new BadRequestException('Cannot transfer to the same account');
      }
      // Lock the sender and receiver accounts with pessimistic write locks
      const [sender, receiver] = await Promise.all([
        queryRunner.manager.findOne(Account, {
          where: { accountNumber: senderAccountNumber },
          lock: { mode: 'pessimistic_write' },
        }),
        queryRunner.manager.findOne(Account, {
          where: { accountNumber: receiverAccountNumber },
          lock: { mode: 'pessimistic_write' },
        }),
      ]);
      if (!sender || !receiver) {
        throw new NotFoundException('Sender or receiver account not found');
      }

      // Ensure numeric conversion
      const senderBalance = Number(sender.balance);
      const receiverBalance = Number(receiver.balance);

      if (senderBalance < amount) {
        throw new BadRequestException('Insufficient funds');
      }
      sender.balance = senderBalance - amount;
      receiver.balance = receiverBalance + amount;
      await queryRunner.manager.save(Account, sender);
      await queryRunner.manager.save(Account, receiver);

      const transaction = this.transactionRepository.create({
        type: 'transfer',
        amount: amount,
        initiatedBy: existingUser,
        senderAccount: sender,
        receiverAccount: receiver,
      });
      await queryRunner.manager.save(Transaction, transaction);
      await queryRunner.commitTransaction();
      return { transaction, message: 'Transfer successful' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('Error transferring funds to the user', error);
      throw new InternalServerErrorException(
        'An error occurred while transferring funds to the user. Please check server logs for details.',
        error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }
  create(createTransactionDto: CreateTransactionDto) {
    return 'This action adds a new transaction';
  }

  findAll() {
    return `This action returns all transactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transaction`;
  }

  update(id: number, updateTransactionDto: UpdateTransactionDto) {
    return `This action updates a #${id} transaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} transaction`;
  }
}
