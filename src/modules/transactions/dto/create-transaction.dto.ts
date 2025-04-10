import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsOptional()
  senderAccountNumber?: string;

  @IsString()
  @IsOptional()
  receiverAccountNumber?: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
