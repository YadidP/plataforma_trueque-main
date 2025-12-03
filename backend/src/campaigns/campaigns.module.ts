import { Module } from '@nestjs/common';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [CampaignsController],
  providers: [CampaignsService],
})
export class CampaignsModule {}