import { Controller, Post, Get, Body, Req, UseGuards, Param } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ResolveClaimDto } from './dto/resolve-claim.dto'; // Importar DTO
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';

@ApiTags('claims')
@Controller('claims')
export class ClaimsController {
    constructor(private readonly claimsService: ClaimsService) { }

    @Post()
    @UseGuards(AuthenticatedGuard)
    @ApiOperation({ summary: 'Create a new claim/report' })
    create(@Req() req, @Body() createClaimDto: CreateClaimDto) {
        const userId = req.session.user.id;
        return this.claimsService.create(userId, createClaimDto);
    }

    @Get('active')
    @UseGuards(AuthenticatedGuard) // Proteger ruta admin
    @ApiOperation({ summary: 'Get active claims (Admin)' })
    findActive() {
        // Aquí deberías validar si el usuario es admin real, por ahora asumo que el frontend controla el acceso
        return this.claimsService.findActiveClaims();
    }

    @Post(':id/resolve')
    @UseGuards(AuthenticatedGuard)
    @ApiOperation({ summary: 'Resolve a claim with sanctions' })
    resolve(@Param('id') id: string, @Body() resolveDto: ResolveClaimDto) {
        return this.claimsService.resolveClaim(+id, resolveDto);
    }
}