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

    // ... (método register se mantiene igual) ...
    async register(createUserDto: CreateUserDto) {
        try {
            const user = await this.usersService.create(createUserDto);
            // Asignar Plan Gratuito
            const subRes = await this.pgService.query("SELECT id FROM subscriptions WHERE priority = 0 LIMIT 1");
            if (subRes.rows.length > 0) {
                const freePlanId = subRes.rows[0].id;
                await this.pgService.query(`INSERT INTO user_subscriptions (user_id, subscription_id, start_date, end_date, is_active) VALUES ($1, $2, NOW(), NOW() + INTERVAL '10 years', true)`, [user.id, freePlanId]);
            }
            return { id: user.id, name: user.name, email: user.email, role: user.role };
        } catch (error) {
            console.error('Error en registro:', error);
            throw new InternalServerErrorException('Error al registrar el usuario.');
        }
    }

    async login(email: string, password: string) {
        // Seleccionamos también los campos de baneo
        const result = await this.pgService.query(
            'SELECT id, name, email, password_hash, role, is_banned, banned_until, ban_reason FROM users WHERE email = $1',
            [email]
        );
        const user = result.rows[0];

        if (!user) throw new UnauthorizedException('Credenciales inválidas');

        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        if (!isPasswordValid) throw new UnauthorizedException('Credenciales inválidas');

        // --- VERIFICACIÓN DE BANEO ---
        this.checkBanStatus(user);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
    }

    async validateUser(userId: number) {
        // Validamos baneo también en la sesión activa (por si lo banearon mientras estaba logueado)
        const result = await this.pgService.query(
            'SELECT id, name, email, role, is_banned, banned_until, ban_reason FROM users WHERE id = $1',
            [userId]
        );
        const user = result.rows[0];
        
        if (user) {
            this.checkBanStatus(user);
        }
        
        return user;
    }

    // Método auxiliar para verificar y lanzar error si está baneado
    private checkBanStatus(user: any) {
        if (user.is_banned) {
            const now = new Date();
            const bannedUntil = user.banned_until ? new Date(user.banned_until) : null;

            // Si tiene fecha de fin y ya pasó, lo desbaneamos automáticamente (opcional, pero buena práctica)
            if (bannedUntil && now > bannedUntil) {
                this.pgService.query('UPDATE users SET is_banned = false, banned_until = NULL WHERE id = $1', [user.id]);
                return; // Ya no está baneado
            }

            // Si sigue baneado, lanzamos excepción con los datos
            throw new ForbiddenException({
                message: 'ACCOUNT_BANNED',
                reason: user.ban_reason || 'Violación de términos de servicio',
                expires: bannedUntil ? bannedUntil.toISOString() : 'Permanente'
            });
        }
    }
}