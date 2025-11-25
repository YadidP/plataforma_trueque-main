import { Controller, Post, Body, Req, Get, UseGuards } from '@nestjs/common';
import { ExchangesService } from './exchanges.service';
import { CreateExchangeDto } from './dto/create-exchange.dto';
import { ApiTags } from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';

@ApiTags('exchanges')
@Controller('exchanges')
@UseGuards(AuthenticatedGuard)
export class ExchangesController {
  constructor(private readonly exchangesService: ExchangesService) {}

  @Post()
  create(@Body() createExchangeDto: CreateExchangeDto, @Req() req) {
    const userId = req.session.user.id;
    return this.exchangesService.create(userId, createExchangeDto);
  }

  @Get()
  findUserExchanges(@Req() req) {
    const userId = req.session.user.id;
    return this.exchangesService.findForUser(userId);
  }
}
