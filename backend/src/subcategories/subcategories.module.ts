import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subcategory } from 'src/entities/subcategory.entity';
import { SubcategoriesController } from './subcategories.controller';
import { SubcategoriesService } from './subcategories.service';
import { Material } from 'src/entities/material.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Subcategory, Material])],
  controllers: [SubcategoriesController],
  providers: [SubcategoriesService],
})
export class SubcategoriesModule {}
