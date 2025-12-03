import { IsBoolean, IsDateString, IsOptional, IsString } from 'class-validator';

export class ProcessClaimDto {
    @IsBoolean()
    deleteListing: boolean;

    @IsString()
    @IsOptional()
    banType: 'none' | '7days' | 'custom' | 'permanent';

    @IsDateString()
    @IsOptional()
    banUntil?: string; // Solo si banType es 'custom'

    @IsString()
    adminNotes: string; // Razón del baneo/eliminación para notificar
}