import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { RecepcionesService } from '../services/recepciones.service';
import { ReporteFaltantesService } from '../services/reporte-faltantes.service';
import { CreateRecepcionDto } from '../dto/create-recepcion.dto';
import { ActualizarCantidadesDto } from '../dto/actualizar-cantidades.dto';
import { ResolverFaltantesDto } from '../dto/resolver-faltantes.dto';

const CONTENT_TYPE_XLSX =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Controller('recepciones')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class RecepcionesController {
  constructor(
    private readonly service: RecepcionesService,
    private readonly reporteService: ReporteFaltantesService,
  ) {}

  @Get()
  findAll(
    @Query('obraId') obraId?: string,
    @Query('proveedor') proveedor?: string,
    @Query('estado') estado?: string,
  ) {
    return this.service.findAll({ obraId, proveedor, estado });
  }

  @Post()
  create(@Body() dto: CreateRecepcionDto) {
    return this.service.create(dto);
  }

  // Ruta literal antes de /:id para evitar conflicto
  @Get('faltantes')
  async getFaltantes(
    @Query('proveedor') proveedor?: string,
    @Query('obraId') obraId?: string,
    @Query('resuelto') resuelto?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('formato') formato?: string,
    @Res() res?: Response,
  ) {
    const resueltoBoolean =
      resuelto !== undefined ? resuelto === 'true' : undefined;

    const data = await this.service.getFaltantes({
      proveedor,
      obraId,
      resuelto: resueltoBoolean,
      fechaDesde,
      fechaHasta,
    });

    if (formato === 'EXCEL') {
      const { buffer, filename } = await this.reporteService.generarExcel(data);
      res!.setHeader('Content-Type', CONTENT_TYPE_XLSX);
      res!.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res!.send(buffer);
    }

    return res!.json(data);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/items')
  actualizarItems(@Param('id') id: string, @Body() dto: ActualizarCantidadesDto) {
    return this.service.actualizarItems(id, dto);
  }

  @Get(':id/sugerencias-faltantes')
  getSugerencias(@Param('id') id: string) {
    return this.service.getSugerenciasFaltantes(id);
  }

  @Post(':id/resolver-faltantes')
  resolverFaltantes(@Param('id') id: string, @Body() dto: ResolverFaltantesDto) {
    return this.service.resolverFaltantes(id, dto.faltanteIds);
  }
}
