import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('wallet')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('saldo')
  getBalance(@Req() req) {
    return this.walletService.getBalance(req.user.id);
  }

  @Get('movimientos')
  getMovements(@Req() req) {
    return this.walletService.getMovements(req.user.id);
  }
}
