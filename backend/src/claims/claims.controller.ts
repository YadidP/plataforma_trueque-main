import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { CreateClaimDto } from './dto/create-claim.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
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
}
