import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FaltantesObraModule } from '../faltantes-obra/faltantes-obra.module';
import { RemitosSalidaController } from './controllers/remitos-salida.controller';
import { RemitosSalidaService } from './services/remitos-salida.service';
import { RemitoExcelService } from './services/remito-excel.service';
import { RemitoNumeradorService } from './services/remito-numerador.service';
import { RemitosSalidaRepository } from './repositories/remitos-salida.repository';
import { ItemRemitoRepository } from './repositories/item-remito.repository';

@Module({
  imports: [PrismaModule, FaltantesObraModule],
  controllers: [RemitosSalidaController],
  providers: [
    RemitosSalidaService,
    RemitoExcelService,
    RemitoNumeradorService,
    RemitosSalidaRepository,
    ItemRemitoRepository,
  ],
  exports: [RemitosSalidaService],
})
export class RemitosSalidaModule {}
