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
import { MateriaisService } from '../services/materiales.service';
import { AliasService } from '../services/alias.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { CreateAliasDto } from '../dto/create-alias.dto';
import { ResolverTextoDto } from '../dto/resolver-resultado.dto';

@Controller('materiales')
@UsePipes(new ValidationPipe({ whitelist: true }))
export class MateriaisController {
  constructor(
    private readonly service: MateriaisService,
    private readonly aliasService: AliasService,
  ) {}

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Post('resolver')
  resolver(@Body() dto: ResolverTextoDto) {
    return this.service.resolver(dto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Post()
  create(@Body() dto: CreateMaterialDto) {
    return this.service.create(dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateMaterialDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  softDelete(@Param('id') id: string) {
    return this.service.softDelete(id);
  }

  @Get(':id/alias')
  getAlias(@Param('id') id: string) {
    return this.aliasService.findByMaterial(id);
  }

  @Post(':id/alias')
  addAlias(@Param('id') id: string, @Body() dto: CreateAliasDto) {
    return this.aliasService.create(id, dto);
  }
}
