import { Controller, Post, Body, UseGuards, Req, Get } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('exchanges')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('exchanges')
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Post()
  create(@Body() createExchangeDto: CreateExchangeDto, @Req() req) {
    return this.exchangesService.create(req.user.id, createExchangeDto);
  }

  @Get()
  findUserExchanges(@Req() req) {
    return this.exchangesService.findForUser(req.user.id);
  }
}
