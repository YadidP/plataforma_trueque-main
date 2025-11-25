// backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { UsersModule } from './users/users.module';
import { WalletModule } from './wallet/wallet.module';
import { CategoriesModule } from './categories/categories.module';
import { ListingsModule } from './listings/listings.module';
import { ExchangesModule } from './exchanges/exchanges.module';
import { CreditsModule } from './credits/credits.module';
import { ReportsModule } from './reports/reports.module';
import { AdminModule } from './admin/admin.module';
import { FilesModule } from './files/files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SubcategoriesModule } from './subcategories/subcategories.module';
import { ImpactModule } from './impact/impact.module';
import { MaterialsModule } from './materials/materials.module';
import { ClaimsModule } from './claims/claims.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      serveRoot: '/uploads/',
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    WalletModule,
    CategoriesModule,
    ListingsModule,
    ExchangesModule,
    CreditsModule,
    ReportsModule,
    AdminModule,
    FilesModule,
    SubcategoriesModule,
    ImpactModule,
    MaterialsModule,
    ClaimsModule,
  ],
})
export class AppModule { }
