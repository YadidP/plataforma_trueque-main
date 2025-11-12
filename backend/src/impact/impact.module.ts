import { Module } from '@nestjs/common';
import { ImpactService } from './impact.service';
import { ImpactController } from './impact.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Material, ImpactMetric, ImpactEquivalence } from '../entities';

@Module({
  imports: [TypeOrmModule.forFeature([Material, ImpactMetric, ImpactEquivalence])],
  providers: [ImpactService],
  controllers: [ImpactController],
  exports: [ImpactService],
})
export class ImpactModule {}
