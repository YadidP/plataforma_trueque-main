// backend/src/database/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PgService } from './pg.service';

@Module({
  imports: [ConfigModule], // Make ConfigModule available
  providers: [PgService],
  exports: [PgService],
})
export class DatabaseModule {}

