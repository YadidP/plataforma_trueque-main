import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { PgService } from '../database/pg.service';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly pgService: PgService,
    ) { }

    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);

        // La billetera se crea automáticamente a través del trigger 't_bono_bienvenida' en la DB

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }

    async login(email: string, password: string) {
        // Buscar usuario incluyendo password_hash
        const result = await this.pgService.query(
            'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
            [email]
        );
        const user = result.rows[0];

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }

    async validateUser(userId: number) {
        return await this.usersService.findOne(userId);
    }
}
