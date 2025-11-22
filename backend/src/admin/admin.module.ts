import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { Listing } from '../entities/listing.entity';
import { Exchange } from '../entities/exchange.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Listing, Exchange])],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule { }
