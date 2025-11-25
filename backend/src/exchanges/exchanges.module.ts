import { Module } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { ExchangesController } from './exchanges.controller';
import { DatabaseModule } from 'src/database/database.module'; // Import DatabaseModule

@Module({
  imports: [DatabaseModule], // Use DatabaseModule to provide PgService
  controllers: [ExchangesController],
  providers: [ExchangesService],
})
export class ExchangesModule { }
