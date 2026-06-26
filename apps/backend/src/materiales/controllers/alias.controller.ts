import { Controller, Delete, Param } from '@nestjs/common';
import { AliasService } from '../services/alias.service';

@Controller('alias')
export class AliasController {
  constructor(private readonly aliasService: AliasService) {}

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.aliasService.delete(id);
  }
}
