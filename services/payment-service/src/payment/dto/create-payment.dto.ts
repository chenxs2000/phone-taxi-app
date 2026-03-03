import { IsString, IsEnum, IsNumber, IsOptional } from 'class-validator';
import { PaymentType } from '../entities/payment.entity';

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsEnum(PaymentType)
  paymentType: PaymentType;

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  remarks?: string;
}
