import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RemitosEntradaController } from './controllers/remitos-entrada.controller';
import { RemitosEntradaService } from './services/remitos-entrada.service';
import { RemitosEntradaRepository } from './repositories/remitos-entrada.repository';

@Module({
  imports: [PrismaModule],
  controllers: [RemitosEntradaController],
  providers: [RemitosEntradaService, RemitosEntradaRepository],
  exports: [RemitosEntradaService],
})
export class RemitosEntradaModule {}
