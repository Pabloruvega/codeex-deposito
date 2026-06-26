import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { RemitosEntradaService } from '../services/remitos-entrada.service';
import { CreateRemitoEntradaDto } from '../dto/create-remito-entrada.dto';

@Controller('remitos-entrada')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class RemitosEntradaController {
  constructor(private readonly service: RemitosEntradaService) {}

  @Get()
  findAll(
    @Query('obraId') obraId?: string,
    @Query('proveedor') proveedor?: string,
  ) {
    return this.service.findAll({ obraId, proveedor });
  }

  @Post()
  create(@Body() dto: CreateRemitoEntradaDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
