import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { DatabaseModule } from 'src/database/database.module'; // Import DatabaseModule
import { FilesModule } from 'src/files/files.module';
import { ImpactModule } from '../impact/impact.module';

@Module({
  imports: [DatabaseModule, FilesModule, ImpactModule], // Use DatabaseModule to provide PgService
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule { }
