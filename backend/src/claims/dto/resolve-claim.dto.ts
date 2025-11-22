import { IsOptional, IsString } from 'class-validator';

export class ResolveClaimDto {
    @IsOptional()
    @IsString()
    resolutionNote?: string;
}
