import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wallet, CreditLog } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, CreditLog])],
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}
