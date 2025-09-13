import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService
    ) {}

    async login(email: string, pass: string): Promise<{ accessToken: string }> {
        const user = await this.usersService.findOneByEmail(email);
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (!isMatch) {
            throw new UnauthorizedException('Credenciales inválidas');
        }
        
        const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }

    async register(createUserDto: CreateUserDto): Promise<{ accessToken: string }> {
        const existingUser = await this.usersService.findOneByEmail(createUserDto.email);
        if (existingUser) {
            throw new ConflictException('El correo electrónico ya está en uso');
        }

        const user = await this.usersService.create(createUserDto);

        const payload = { sub: user.id, email: user.email, name: user.name, role: user.role };
        return {
            accessToken: this.jwtService.sign(payload),
        };
    }
}
