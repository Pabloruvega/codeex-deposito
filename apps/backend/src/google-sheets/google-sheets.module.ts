import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { GoogleSheetsAuthService } from './services/google-sheets-auth.service';
import { SheetsReaderService } from './services/sheets-reader.service';
import { SheetsWriterService } from './services/sheets-writer.service';
import { GoogleSheetsController } from './controllers/google-sheets.controller';

@Module({
  imports: [PrismaModule],
  controllers: [GoogleSheetsController],
  providers: [GoogleSheetsAuthService, SheetsReaderService, SheetsWriterService],
  exports: [SheetsWriterService, SheetsReaderService],
})
export class GoogleSheetsModule {}
