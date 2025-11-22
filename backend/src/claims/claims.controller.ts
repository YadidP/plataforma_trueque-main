import { Controller, Post, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../common/enums';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('claims')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('claims')
export class ClaimsController {
    constructor(private readonly claimsService: ClaimsService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new claim/report' })
    create(@Req() req, @Body() createClaimDto: CreateClaimDto) {
        return this.claimsService.create(req.user.id, createClaimDto);
    }

    // Admin endpoints
    @Get()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get all claims (Admin only)' })
    findAll() {
        return this.claimsService.findAll();
    }

    @Get('active')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Get active claims (Admin only)' })
    findActive() {
        return this.claimsService.findActiveClaims();
    }

    @Patch(':id/resolve')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN)
    @ApiOperation({ summary: 'Resolve a claim (Admin only)' })
    resolve(@Param('id') id: string) {
        return this.claimsService.resolveClaim(+id);
    }
}
