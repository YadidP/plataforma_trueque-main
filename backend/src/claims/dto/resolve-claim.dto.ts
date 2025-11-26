import { IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ResolveClaimDto {
    @ApiProperty({ description: 'Acción a tomar: ignorar o sancionar' })
    @IsString()
    @IsIn(['dismiss', 'delete_listing'])
    action: 'dismiss' | 'delete_listing';

    @ApiProperty({ description: 'Mensaje para el usuario (motivo)' })
    @IsString()
    @IsNotEmpty()
    adminMessage: string;

    @ApiProperty({ description: 'Tipo de sanción al usuario' })
    @IsString()
    @IsIn(['none', 'temp_ban', 'perm_ban'])
    sanctionType: 'none' | 'temp_ban' | 'perm_ban';
}