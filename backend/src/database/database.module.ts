// backend/src/database/database.module.ts
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,     // <-- clave
        synchronize: false,         // producible; usamos SQL en db/init
        logging: true,
      }),
    }),
  ],
})
export class DatabaseModule {}
