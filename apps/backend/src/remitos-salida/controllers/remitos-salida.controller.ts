import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { RemitosSalidaService } from '../services/remitos-salida.service';
import { CreateRemitoDto } from '../dto/create-remito.dto';

const CONTENT_TYPE_XLSX =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Controller('remitos-salida')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class RemitosSalidaController {
  constructor(private readonly service: RemitosSalidaService) {}

  @Get()
  findAll(
    @Query('obraId') obraId?: string,
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
  ) {
    return this.service.findAll({ obraId, fechaDesde, fechaHasta });
  }

  @Post()
  create(@Body() dto: CreateRemitoDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Get(':id/descargar')
  async descargar(@Param('id') id: string, @Res() res: Response) {
    const { buffer, filename } = await this.service.descargarExcel(id);
    res.setHeader('Content-Type', CONTENT_TYPE_XLSX);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
