import { Body, Controller, Get, Param, Patch, Query, UsePipes, ValidationPipe } from '@nestjs/common';
import { FaltantesObraService } from '../services/faltantes-obra.service';
import { UpdateFaltanteObraDto } from '../dto/update-faltante-obra.dto';

@Controller('faltantes-obra')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class FaltantesObraController {
  constructor(private readonly service: FaltantesObraService) {}

  @Get()
  findAll(
    @Query('obraId') obraId?: string,
    @Query('estado') estado?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.service.findAll({ obraId, estado, fechaDesde, fechaHasta });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body() dto: UpdateFaltanteObraDto) {
    return this.service.updateEstado(id, dto);
  }
}
