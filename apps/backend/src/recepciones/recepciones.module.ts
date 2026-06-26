import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { StockModule } from '../stock/stock.module';
import { RecepcionesController } from './controllers/recepciones.controller';
import { RecepcionesService } from './services/recepciones.service';
import { ComparadorFacturaService } from './services/comparador-factura.service';
import { ReporteFaltantesService } from './services/reporte-faltantes.service';
import { RecepcionesRepository } from './repositories/recepciones.repository';
import { FaltantesProveedorRepository } from './repositories/faltantes-proveedor.repository';

@Module({
  imports: [PrismaModule, StockModule],
  controllers: [RecepcionesController],
  providers: [
    RecepcionesService,
    ComparadorFacturaService,
    ReporteFaltantesService,
    RecepcionesRepository,
    FaltantesProveedorRepository,
  ],
  exports: [RecepcionesService],
})
export class RecepcionesModule {}
