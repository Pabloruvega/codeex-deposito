import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { AliasRepository } from '../repositories/alias.repository';
import { MateriaisRepository } from '../repositories/materiales.repository';
import { CreateAliasDto } from '../dto/create-alias.dto';

@Injectable()
export class AliasService {
  constructor(
    private readonly aliasRepo: AliasRepository,
    private readonly materialesRepo: MateriaisRepository,
  ) {}

  async findByMaterial(materialId: string) {
    const material = await this.materialesRepo.findById(materialId);
    if (!material) throw new NotFoundException('MATERIAL_NOT_FOUND');
    return this.aliasRepo.findByMaterialId(materialId);
  }

  async create(materialId: string, dto: CreateAliasDto) {
    const material = await this.materialesRepo.findById(materialId);
    if (!material) throw new NotFoundException('MATERIAL_NOT_FOUND');

    const existente = await this.aliasRepo.findByTexto(dto.texto);
    if (existente) throw new ConflictException('ALIAS_DUPLICADO');

    return this.aliasRepo.create(materialId, dto.texto, dto.creadoPor ?? 'DEPOSITO');
  }

  async delete(id: string) {
    const alias = await this.aliasRepo.findById(id);
    if (!alias) throw new NotFoundException('ALIAS_NOT_FOUND');
    return this.aliasRepo.delete(id);
  }
}
