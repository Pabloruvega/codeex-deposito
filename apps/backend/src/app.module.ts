import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { PrismaModule } from './prisma/prisma.module';
import { MaterialesModule } from './materiales/materiales.module';
import { ObrasModule } from './obras/obras.module';
import { PedidosModule } from './pedidos/pedidos.module';
import { StockModule } from './stock/stock.module';
import { FaltantesObraModule } from './faltantes-obra/faltantes-obra.module';
import { RemitosSalidaModule } from './remitos-salida/remitos-salida.module';
import { RemitosEntradaModule } from './remitos-entrada/remitos-entrada.module';
import { RecepcionesModule } from './recepciones/recepciones.module';
import { GoogleSheetsModule } from './google-sheets/google-sheets.module';

@Module({
  imports: [
    PrismaModule,
    MaterialesModule,
    ObrasModule,
    PedidosModule,
    StockModule,
    FaltantesObraModule,
    RemitosSalidaModule,
    RemitosEntradaModule,
    RecepcionesModule,
    GoogleSheetsModule,
    ConfigModule.forRoot({ isGlobal: true }),
  ],
})
export class AppModule {}
