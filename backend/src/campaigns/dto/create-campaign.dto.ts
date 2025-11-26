import { IsString, IsNotEmpty, IsNumber, IsIn, IsOptional, IsDateString } from 'class-validator';

export class CreateCampaignDto {
  @IsString() @IsNotEmpty() title: string;
  @IsString() @IsNotEmpty() description: string;
  @IsString() @IsIn(['manual', 'metrica']) type: 'manual' | 'metrica';
  
  @IsOptional() @IsString() targetMetricCode?: string;
  @IsOptional() @IsNumber() targetValue?: number;
  
  @IsNumber() @IsNotEmpty() rewardCredits: number;
  @IsOptional() @IsDateString() endDate?: string;
}