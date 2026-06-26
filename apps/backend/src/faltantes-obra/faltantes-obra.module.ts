import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { FaltantesObraController } from './controllers/faltantes-obra.controller';
import { FaltantesObraService } from './services/faltantes-obra.service';
import { FaltantesObraRepository } from './repositories/faltantes-obra.repository';

@Module({
  imports: [PrismaModule],
  controllers: [FaltantesObraController],
  providers: [FaltantesObraService, FaltantesObraRepository],
  exports: [FaltantesObraService],
})
export class FaltantesObraModule {}
