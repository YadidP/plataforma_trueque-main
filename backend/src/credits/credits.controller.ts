import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('credits')
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}
  
  @Get('packages')
  getPackages() {
    return this.creditsService.getCreditPackages();
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('purchase')
  purchase(@Body() purchaseCreditsDto: PurchaseCreditsDto, @Req() req) {
    return this.creditsService.purchase(req.user.id, purchaseCreditsDto);
  }
}
