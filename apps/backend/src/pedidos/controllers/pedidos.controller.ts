import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import type { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { PedidosService } from '../services/pedidos.service';
import { ActualizarItemDto } from '../dto/actualizar-item.dto';
import { ConfirmarPedidoDto } from '../dto/confirmar-pedido.dto';

const MIMETYPES_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
const CONTENT_TYPE_XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

@Controller('pedidos')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class PedidosController {
  constructor(private readonly service: PedidosService) {}

  @Get()
  findAll(
    @Query('obraId') obraId?: string,
    @Query('estado') estado?: string,
  ) {
    return this.service.findAll({ obraId, estado });
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  create(
    @UploadedFile() archivo: Express.Multer.File,
    @Body('obraId') obraId: string,
  ) {
    if (!archivo) throw new BadRequestException('ARCHIVO_INVALIDO');
    if (!MIMETYPES_PERMITIDOS.includes(archivo.mimetype)) {
      throw new BadRequestException('ARCHIVO_INVALIDO');
    }
    if (!obraId) throw new BadRequestException('obraId es requerido');
    return this.service.create(archivo, obraId);
  }

  @Post('remito-directo')
  @UseInterceptors(
    FileInterceptor('archivo', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async generarRemitoDirecto(
    @UploadedFile() archivo: Express.Multer.File,
    @Body('obraId') obraId: string,
    @Body('encargadoDeposito') encargadoDeposito: string,
    @Body('encargadoTraslado') encargadoTraslado: string,
    @Res() res: Response,
  ): Promise<void> {
    if (!archivo) throw new BadRequestException('ARCHIVO_INVALIDO');
    if (!MIMETYPES_PERMITIDOS.includes(archivo.mimetype)) throw new BadRequestException('ARCHIVO_INVALIDO');
    if (!obraId) throw new BadRequestException('obraId es requerido');
    if (!encargadoDeposito) throw new BadRequestException('encargadoDeposito es requerido');
    if (!encargadoTraslado) throw new BadRequestException('encargadoTraslado es requerido');

    const { buffer, filename } = await this.service.generarRemitoDirecto(
      archivo, obraId, encargadoDeposito, encargadoTraslado,
    );

    res.setHeader('Content-Type', CONTENT_TYPE_XLSX);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id/items/:itemId')
  actualizarItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: ActualizarItemDto,
  ) {
    return this.service.actualizarItem(id, itemId, dto);
  }

  @Post(':id/confirmar')
  confirmar(@Param('id') id: string, @Body() dto: ConfirmarPedidoDto) {
    return this.service.confirmar(id, dto.confirmadoPor);
  }
}
