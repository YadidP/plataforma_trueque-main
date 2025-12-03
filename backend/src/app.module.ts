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
import { ScheduleModule } from '@nestjs/schedule'; // <-- Added ScheduleModule import
import { CampaignsModule } from './campaigns/campaigns.module'; // <-- Added CampaignsModule import

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ScheduleModule.forRoot(), // <-- Added ScheduleModule.forRoot()
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
    CampaignsModule, // <-- Added CampaignsModule
  ],
})
export class AppModule { }