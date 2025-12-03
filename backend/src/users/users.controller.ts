// Añadir imports necesarios
import { Controller, Get, Put, Post, Body, Param, Req, UseGuards, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthenticatedGuard } from '../auth/guards/authenticated.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile/:id')
  getProfile(@Param('id') id: string, @Req() req) {
    // Obtenemos el ID del usuario que visita (si está logueado)
    const viewerId = req.session?.user?.id || null;
    return this.usersService.getPublicProfile(+id, viewerId);
  }

  @Put('profile')
  @UseGuards(AuthenticatedGuard)
  updateProfile(@Req() req, @Body() body: { bio: string }) {
    return this.usersService.updateBio(req.session.user.id, body.bio);
  }

  @Post('rate')
  @UseGuards(AuthenticatedGuard)
  rateUser(@Req() req, @Body() body: { targetId: number, exchangeId: number, rating: number, comment: string }) {
    return this.usersService.addReview(req.session.user.id, body);
  }
}