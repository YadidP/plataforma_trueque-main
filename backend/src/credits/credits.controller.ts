import { Controller, Get, Post, Body, Req, UseGuards } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { PurchaseCreditsDto } from './dto/purchase-credits.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreditPackage } from './dto/credit-package.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';

@ApiTags('credits')
@Controller('credits')
export class CreditsController {
  constructor(private readonly creditsService: CreditsService) { }

  // Obtener paquetes de créditos
  @Get('packages')
  getPackages(): CreditPackage[] {
    return this.creditsService.getCreditPackages();
  }

  // Comprar créditos (Recarga de saldo)
  @Post('purchase')
  @UseGuards(AuthenticatedGuard)
  purchase(@Body() purchaseCreditsDto: PurchaseCreditsDto, @Req() req) {
    const userId = req.session.user.id;
    // CORREGIDO: Se llama a 'purchase', no a 'purchaseCredits'
    return this.creditsService.purchase(userId, purchaseCreditsDto);
  }

  // --- SECCIÓN DE SUSCRIPCIONES (NUEVO) ---

  // Obtener planes disponibles
  @Get('plans')
  getPlans() {
    return this.creditsService.getSubscriptionPlans();
  }

  // Obtener mi suscripción actual
  @Get('my-subscription')
  @UseGuards(AuthenticatedGuard)
  getMySubscription(@Req() req) {
    const userId = req.session.user.id;
    return this.creditsService.getActiveSubscription(userId);
  }

  // Suscribirse a un plan
  @Post('subscribe')
  @UseGuards(AuthenticatedGuard)
  subscribe(@Body() body: { planId: number }, @Req() req) {
    const userId = req.session.user.id;
    return this.creditsService.buySubscription(userId, body.planId);
  }
}