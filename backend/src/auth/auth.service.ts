import { Injectable, InternalServerErrorException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
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
        try {
            // 1. Crear usuario (La billetera se crea por Trigger en DB)
            const user = await this.usersService.create(createUserDto);

            // 2. Asignar Plan Gratuito Automáticamente
            // Buscamos el plan con prioridad 0 (Gratuito)
            const subRes = await this.pgService.query("SELECT id FROM subscriptions WHERE priority = 0 LIMIT 1");
            
            if (subRes.rows.length > 0) {
                const freePlanId = subRes.rows[0].id;
                await this.pgService.query(`
                    INSERT INTO user_subscriptions (user_id, subscription_id, start_date, end_date, is_active)
                    VALUES ($1, $2, NOW(), NOW() + INTERVAL '10 years', true)
                `, [user.id, freePlanId]);
            } else {
                console.warn('ADVERTENCIA: No se encontró un plan gratuito (prioridad 0) en la base de datos para asignar al usuario nuevo.');
            }

            return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            };
        } catch (error) {
            console.error('Error en registro:', error);
            throw new InternalServerErrorException('Error al registrar el usuario. Intente nuevamente.');
        }
    }

    async login(email: string, password: string) {
        const result = await this.pgService.query(
            'SELECT id, name, email, password_hash, role, banned_until, ban_reason FROM users WHERE email = $1',
            [email]
        );
        const user = result.rows[0];

        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
        }

        // --- NUEVA LÓGICA DE BANEO ---
        if (user.banned_until && new Date(user.banned_until) > new Date()) {
            throw new ForbiddenException({
                message: 'Cuenta suspendida',
                reason: user.ban_reason,
                until: user.banned_until
            });
        }
        // -----------------------------

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciales inválidas');
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