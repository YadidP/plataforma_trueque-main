import { Module } from '@nestjs/common';
import { ClaimsService } from './claims.service';
import { ClaimsController } from './claims.controller';
import { DatabaseModule } from 'src/database/database.module'; // Import DatabaseModule

@Module({
    imports: [DatabaseModule], // Use DatabaseModule to provide PgService
    controllers: [ClaimsController],
    providers: [ClaimsService],
    exports: [ClaimsService],
})
export class ClaimsModule { }
