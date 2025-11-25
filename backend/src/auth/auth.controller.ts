import { Controller, Post, Body, Get, Req, Res, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto, @Req() req: Request, @Res() res: Response) {
        const user = await this.authService.register(createUserDto);

        // Guardar usuario en sesión
        req.session.userId = user.id;
        req.session.user = user;

        // Forzar guardado de sesión antes de responder
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).json({ message: 'Error creating session' });
            }
            console.log('Session saved for user:', user.id);
            return res.json({ message: 'Registration successful', user });
        });
    }

    @Post('login')
    async login(@Body() loginDto: LoginDto, @Req() req: Request, @Res() res: Response) {
        const user = await this.authService.login(loginDto.email, loginDto.password);

        // Guardar usuario en sesión
        req.session.userId = user.id;
        req.session.user = user;

        // Forzar guardado de sesión antes de responder
        req.session.save((err) => {
            if (err) {
                console.error('Error saving session:', err);
                return res.status(500).json({ message: 'Error creating session' });
            }
            console.log('Session saved for user:', user.id);
            return res.json({ message: 'Login successful', user });
        });
    }

    @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        req.session.destroy((err) => {
            if (err) {
                return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Logout failed' });
            }
            res.clearCookie('connect.sid'); // Nombre por defecto de la cookie de sesión
            return res.status(HttpStatus.OK).json({ message: 'Logout successful' });
        });
    }

    @Get('me')
    async getMe(@Req() req: Request) {
        console.log('Session in me:', req.session);
        if (!req.session.userId) {
            return { user: null };
        }

        const user = await this.authService.validateUser(req.session.userId);
        return { user };
    }
}
