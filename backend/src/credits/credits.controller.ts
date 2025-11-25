import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreditPackage } from './dto/credit-package.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';

@ApiTags('credits')
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) {}
  
  @Get('packages')
  getPackages(): CreditPackage[] {
    return this.creditsService.getCreditPackages();
  }

  @Post('purchase')
  @UseGuards(AuthenticatedGuard)
  purchase(@Body() purchaseCreditsDto: PurchaseCreditsDto, @Req() req) {
    const userId = req.session.user.id;
    return this.creditsService.purchase(userId, purchaseCreditsDto);
  }
}
