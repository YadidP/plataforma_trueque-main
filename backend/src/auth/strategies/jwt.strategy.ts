import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // El payload ya fue validado por passport-jwt (firma y expiración)
    // Aquí podemos añadir lógica extra, como verificar si el usuario aún existe
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
        throw new UnauthorizedException('Usuario no encontrado o token inválido.');
    }
    // Lo que retornemos aquí se adjuntará a `req.user`
    return { id: user.id, email: user.email, name: user.name, role: user.role };
  }
}
