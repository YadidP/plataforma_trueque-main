import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exchange, Listing } from 'src/entities'; // Importar entidades necesarias

@Module({
  // CORRECCIÓN: Añadir las entidades que usa el servicio
  imports: [TypeOrmModule.forFeature([Exchange, Listing])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}