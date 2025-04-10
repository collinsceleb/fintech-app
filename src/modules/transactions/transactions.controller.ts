import {
  Controller,
  Post,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Get,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { Transaction } from './entities/transaction.entity';
import { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post('transfer')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: User,
  })
  async transferFunds(
    @Req() request: Request,
    @Body() transferDto: CreateTransactionDto,
  ): Promise<{ transaction: Transaction; message: string }> {
    return await this.transactionsService.transferFunds(request, transferDto);
  }

  @Post('deposit')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: User,
  })
  async depositFunds(
    @Req() request: Request,
    @Body() depositDto: CreateTransactionDto,
  ): Promise<{ transaction: Transaction; message: string }> {
    return await this.transactionsService.depositFunds(request, depositDto);
  }

  @Post('withdraw')
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: User,
  })
  async withdrawFunds(
    @Req() request: Request,
    @Body() withdrawDto: CreateTransactionDto,
  ): Promise<{ transaction: Transaction; message: string }> {
    return await this.transactionsService.withdrawFunds(request, withdrawDto);
  }

  @Get('balance')
  async getAccountBalance(@Req() request: Request) {
    return await this.transactionsService.getAccountBalance(request);
  }
}
