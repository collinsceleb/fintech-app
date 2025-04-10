import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from "@nestjs/swagger";

export class CreateTransactionDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  senderAccountNumber?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  receiverAccountNumber?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;
}
