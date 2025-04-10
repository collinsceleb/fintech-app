import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateTransactionDto {
  @IsString()
  @IsNotEmpty()
  senderAccountNumber: string;

  @IsString()
  @IsNotEmpty()
  receiverAccountNumber: string;

  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
