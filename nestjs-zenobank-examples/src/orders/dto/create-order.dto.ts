import { IsString, IsNotEmpty, IsISO4217CurrencyCode } from 'class-validator';
import { IsPositiveNumberString } from 'src/lib/is-positive-number-string';

export class CreateOrderDto {
  @IsNotEmpty()
  @IsPositiveNumberString()
  amount: string;

  @IsString()
  @IsNotEmpty()
  @IsISO4217CurrencyCode()
  currency: string;
}
