import { IsString, IsOptional } from 'class-validator';

export class ProcessPaymentDto {
  @IsString()
  paymentId: string;

  @IsString()
  @IsOptional()
  transactionId?: string;
}

export class RefundPaymentDto {
  @IsString()
  paymentId: string;

  @IsString()
  @IsOptional()
  reason?: string;
}
