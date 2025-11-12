import { Controller, Post, Body } from '@nestjs/common';
import { ImpactService } from './impact.service';
import { ImpactDto } from './dto/impact.dto';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';

@ApiTags('impact')
@Controller('impact')
export class ImpactController {
  constructor(private readonly impactService: ImpactService) {}

  @Post('preview')
  @ApiOperation({ summary: 'Calculate environmental impact preview' })
  @ApiResponse({ status: 200, description: 'Environmental impact calculated successfully.' })
  async getImpactPreview(@Body() impactDto: ImpactDto) {
    return this.impactService.calculateImpactPreview(impactDto);
  }
}
