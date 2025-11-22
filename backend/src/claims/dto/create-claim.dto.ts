import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateClaimDto {
    @ApiProperty({ description: 'ID of the exchange being reported (optional)', required: false })
    @IsOptional()
    @IsNumber()
    exchangeId?: number;

    @ApiProperty({ description: 'ID of the listing being reported (optional)', required: false })
    @IsOptional()
    @IsNumber()
    listingId?: number;

    @ApiProperty({ description: 'Reason for the claim/report' })
    @IsNotEmpty()
    @IsString()
    reason: string;
}
