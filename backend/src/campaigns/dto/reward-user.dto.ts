import { IsEmail, IsNotEmpty, IsNumber } from 'class-validator';

export class RewardUserDto {
  @IsEmail() @IsNotEmpty() userEmail: string;
  @IsNumber() @IsNotEmpty() campaignId: number;
}