import { ApiProperty } from '@nestjs/swagger';
import { TransactionStatus, TransactionType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class TransactionsDto {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEnum(TransactionType)
  type: TransactionType;

  @ApiProperty({ required: true })
  @IsOptional()
  @IsEnum(TransactionStatus)
  status?: TransactionStatus;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  categoryId: string;
}
