import { Module } from '@nestjs/common';
import { ObrasController } from './controllers/obras.controller';
import { ObrasService } from './services/obras.service';
import { ObraProveedorService } from './services/obra-proveedor.service';
import { ObrasRepository } from './repositories/obras.repository';
import { ObraProveedorRepository } from './repositories/obra-proveedor.repository';

@Module({
  controllers: [ObrasController],
  providers: [ObrasService, ObraProveedorService, ObrasRepository, ObraProveedorRepository],
  exports: [ObrasService],
})
export class ObrasModule {}
