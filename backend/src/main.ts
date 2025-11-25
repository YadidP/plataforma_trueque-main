import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Prefijo global para todas las rutas
  app.setGlobalPrefix('api');

  // CORS habilitado para frontend
  app.enableCors({
    origin: 'http://localhost:5173', // URL del frontend
    credentials: true, // Permitir cookies
  });

  // Configuración de sesiones
  app.use(
    session({
      secret: configService.get('SESSION_SECRET') || 'super-secret-key-change-in-production',
      name: 'sessionId', // Nombre de la cookie
      resave: false,
      saveUninitialized: false,
      cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 24 horas
        httpOnly: false, // Cambiar a false para debugging
        sameSite: 'lax',
        secure: false,
      },
    }),
  );

  // Seguridad (helmet después de session)
  app.use(helmet({
    contentSecurityPolicy: false, // Deshabilitado para desarrollo
  }));

  // Pipes globales para validación automática
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Elimina propiedades no definidas en los DTOs
    transform: true, // Transforma los payloads a instancias de DTOs
    forbidNonWhitelisted: true,
  }));

  // Documentación Swagger
  const config = new DocumentBuilder()
    .setTitle('Créditos Verdes API')
    .setDescription('API para la plataforma de trueque Créditos Verdes')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = configService.get('PORT') || 3000;
  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
