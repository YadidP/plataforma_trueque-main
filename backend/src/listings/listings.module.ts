import { Module } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Listing, User, Category } from 'src/entities';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, User, Category]), FilesModule],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ListingsModule {}
