import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ObrasService } from '../services/obras.service';
import { ObraProveedorService } from '../services/obra-proveedor.service';
import { CreateObraDto } from '../dto/create-obra.dto';
import { UpdateObraDto } from '../dto/update-obra.dto';
import { CreateObraProveedorDto } from '../dto/create-obra-proveedor.dto';

@Controller('obras')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class ObrasController {
  constructor(
    private readonly service: ObrasService,
    private readonly proveedorService: ObraProveedorService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post()
  create(@Body() dto: CreateObraDto) {
    return this.service.create(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateObraDto) {
    return this.service.update(id, dto);
  }

  @Get(':id/proveedores')
  getProveedores(@Param('id') id: string) {
    return this.proveedorService.findByObra(id);
  }

  @Post(':id/proveedores')
  addProveedor(@Param('id') id: string, @Body() dto: CreateObraProveedorDto) {
    return this.proveedorService.create(id, dto);
  }

  @Delete('proveedores/:proveedorId')
  removeProveedor(@Param('proveedorId') proveedorId: string) {
    return this.proveedorService.desactivar(proveedorId);
  }
}
