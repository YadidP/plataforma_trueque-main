import { Controller, Get, Post, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { RewardUserDto } from './dto/reward-user.dto';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';

@Controller('campaigns')
@UseGuards(AuthenticatedGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateCampaignDto) {
    // Aquí podrías validar que req.session.user.role === 'emprendedor'
    return this.campaignsService.create(req.session.user.id, dto);
  }

  @Get()
  findAll(@Req() req) {
    return this.campaignsService.findAll(req.session.user.role, req.session.user.id);
  }

  @Post('reward/manual')
  rewardManual(@Req() req, @Body() dto: RewardUserDto) {
    return this.campaignsService.rewardUserManually(req.session.user.id, dto.userEmail, dto.campaignId);
  }

  @Post(':id/claim')
  claimReward(@Req() req, @Param('id') id: string) {
    return this.campaignsService.claimAutomaticReward(req.session.user.id, +id);
  }
}
