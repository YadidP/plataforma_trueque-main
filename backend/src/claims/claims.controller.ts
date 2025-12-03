import { Controller, Post, Get, Patch, Param, Body, Req, UseGuards } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { ProcessClaimDto } from './dto/process-claim.dto';
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

    // Admin endpoints (now public for simplification)
    @Get()
    @ApiOperation({ summary: 'Get all claims (Admin only - now public)' })
    findAll() {
        return this.claimsService.findAll();
    }

    @Get('active')
    @ApiOperation({ summary: 'Get active claims (Admin only - now public)' })
    findActive() {
        return this.claimsService.findActiveClaims();
    }

    @Patch(':id/resolve')
    @ApiOperation({ summary: 'Resolve a claim (Admin only - now public)' })
    resolve(@Param('id') id: string) {
        return this.claimsService.resolveClaim(+id);
    }

    @Get(':id')
    @UseGuards(AuthenticatedGuard)
    getOne( @Param('id') id: string) {
        return this.claimsService.getClaimById(+id);
    }

    @Post(':id/resolve')
    @UseGuards(AuthenticatedGuard) // Asegúrate de que solo admin pueda, aquí simplificado
    process( @Param('id') id: string, @Body() dto: ProcessClaimDto) {
        return this.claimsService.processClaim(+id, dto);
    }
}
