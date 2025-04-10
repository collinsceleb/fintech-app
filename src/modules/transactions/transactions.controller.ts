import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
@SerializeOptions({
  type: User,
})
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  async transferFunds(
    @Req() request: Request,
    @Body() transferDto: CreateTransactionDto,
  ): Promise<{ transaction: Transaction; message: string }> {
    return await this.transactionsService.transferFunds(request, transferDto);
  }

  @Post('deposit')
  async depositFunds(
    @Req() request: Request,
    @Body() depositDto: CreateTransactionDto,
  ): Promise<{ transaction: Transaction; message: string }> {
    return await this.transactionsService.depositFunds(request, depositDto);
  }

  @Post('withdraw')
  async withdrawFunds(
    @Req() request: Request,
    @Body() withdrawDto: CreateTransactionDto,
  ): Promise<{ transaction: Transaction; message: string }> {
    return await this.transactionsService.withdrawFunds(request, withdrawDto);
  }
}
