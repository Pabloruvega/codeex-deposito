import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UploadedFile,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import multer from 'multer';
import { PedidosService } from '../services/pedidos.service';
import { ActualizarItemDto } from '../dto/actualizar-item.dto';
import { ConfirmarPedidoDto } from '../dto/confirmar-pedido.dto';

const MIMETYPES_PERMITIDOS = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

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
