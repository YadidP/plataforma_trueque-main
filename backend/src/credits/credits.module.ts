import { Module } from '@nestjs/common';
import { CreditsService } from './credits.service';
import { CreditsController } from './credits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreditPurchase } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([CreditPurchase])],
  controllers: [CreditsController],
  providers: [CreditsService],
})
export class CreditsModule {}
