import { Module } from '@nestjs/common';
import { MaterialsService } from './materials.service';
import { MaterialsController } from './materials.controller';
import { DatabaseModule } from 'src/database/database.module'; // Import DatabaseModule

@Module({
  imports: [DatabaseModule], // Use DatabaseModule to provide PgService
  controllers: [MaterialsController],
  providers: [MaterialsService],
})
export class MaterialsModule {}

