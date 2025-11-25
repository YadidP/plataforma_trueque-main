import { Module } from '@nestjs/common';
import { SubcategoriesController } from './subcategories.controller';
import { SubcategoriesService } from './subcategories.service';
import { DatabaseModule } from 'src/database/database.module'; // Import DatabaseModule

@Module({
  imports: [DatabaseModule], // Use DatabaseModule to provide PgService
  controllers: [SubcategoriesController],
  providers: [SubcategoriesService],
})
export class SubcategoriesModule {}

