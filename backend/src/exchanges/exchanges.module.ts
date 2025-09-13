import { Module } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange, Listing, User } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([Exchange, Listing, User])],
  controllers: [ExchangesController],
  providers: [ExchangesService],
})
export class ExchangesModule {}
