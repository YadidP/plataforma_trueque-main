import { Module } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange, Listing, User, ExchangeImpact } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Exchange, Listing, User, ExchangeImpact])],

  controllers: [ExchangesController],
  providers: [ExchangesService],
})
export class ExchangesModule { }
