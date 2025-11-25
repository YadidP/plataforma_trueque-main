import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@ApiTags('wallet')
@Controller('wallet')
@UseGuards(AuthenticatedGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('saldo')
  getBalance(@Req() req) {
    const userId = req.session.user.id;
    return this.walletService.getBalance(userId);
  }

  @Get('movimientos')
  getMovements(@Req() req) {
    const userId = req.session.user.id;
    return this.walletService.getMovements(userId);
  }
}
