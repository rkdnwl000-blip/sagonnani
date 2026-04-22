import { IsString, IsNumber, Min } from 'class-validator';

export class PreparePaymentDto {
  @IsNumber()
  @Min(10000)
  amount: number; // 최소 1만원
}

export class ConfirmPaymentDto {
  @IsString()
  paymentKey: string;

  @IsString()
  orderId: string;

  @IsNumber()
  amount: number;
}
