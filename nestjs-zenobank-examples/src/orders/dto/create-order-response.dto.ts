import { Expose } from 'class-transformer';

export class OrderResponseDto {
  @Expose()
  id: string;

  @Expose()
  status: string;

  @Expose()
  amount: string;

  @Expose()
  currency: string;

  @Expose()
  checkoutUrl: string | null;
}
