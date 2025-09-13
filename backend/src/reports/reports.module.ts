import { Module } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ReportsController } from './reports.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImpactDaily, Exchange, Listing } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([ImpactDaily, Exchange, Listing])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
