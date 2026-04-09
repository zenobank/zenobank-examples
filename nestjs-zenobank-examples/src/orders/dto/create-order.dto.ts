import { IsString, IsNotEmpty, IsNumberString } from 'class-validator';

export class CreateOrderDto {
  @IsNumberString()
  @IsNotEmpty()
  amount: string;

  @IsString()
  @IsNotEmpty()
  currency: string;
}
