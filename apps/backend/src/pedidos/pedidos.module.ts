import { Module } from '@nestjs/common';
import { PedidosController } from './controllers/pedidos.controller';
import { PedidosService } from './services/pedidos.service';
import { PdfExtractorService } from './services/pdf-extractor.service';
import { ImageExtractorService } from './services/image-extractor.service';
import { OcrService } from './services/ocr.service';
import { PedidoResolverService } from './services/pedido-resolver.service';
import { PedidosRepository } from './repositories/pedidos.repository';
import { MaterialesModule } from '../materiales/materiales.module';
import { ObrasModule } from '../obras/obras.module';

@Module({
  imports: [MaterialesModule, ObrasModule],
  controllers: [PedidosController],
  providers: [
    PedidosService,
    PdfExtractorService,
    ImageExtractorService,
    OcrService,
    PedidoResolverService,
    PedidosRepository,
  ],
  exports: [PedidosService],
})
export class PedidosModule {}
