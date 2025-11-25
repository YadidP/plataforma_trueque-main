import { Module } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { DatabaseModule } from 'src/database/database.module'; // Import DatabaseModule

@Module({
  imports: [DatabaseModule], // Use DatabaseModule to provide PgService
  controllers: [WalletController],
  providers: [WalletService],
})
export class WalletModule {}

