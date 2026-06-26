import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StockController } from './controllers/stock.controller';
import { StockService } from './services/stock.service';
import { StockReaderService } from './services/stock-reader.service';
import { StockWriterService } from './services/stock-writer.service';
import { StockRepository } from './repositories/stock.repository';

@Module({
  imports: [PrismaModule],
  controllers: [StockController],
  providers: [StockService, StockReaderService, StockWriterService, StockRepository],
  exports: [StockService, StockRepository],
})
export class StockModule {}
