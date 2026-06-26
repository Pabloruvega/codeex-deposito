import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { MateriaisRepository } from '../repositories/materiales.repository';
import { AliasResolverService } from './alias-resolver.service';
import { CreateMaterialDto } from '../dto/create-material.dto';
import { UpdateMaterialDto } from '../dto/update-material.dto';
import { ResolverTextoDto, ResolverResultadoDto } from '../dto/resolver-resultado.dto';

const CANOS_EN_UNIDADES = ['CANO_CLOACA', 'CANO_GAS', 'CANO_ELECTRICO'];

@Injectable()
export class MateriaisService {
  constructor(
    private readonly repo: MateriaisRepository,
    private readonly aliasResolver: AliasResolverService,
  ) {}

  findAll() {
    return this.repo.findAll();
  }

  async findById(id: string) {
    const material = await this.repo.findById(id);
    if (!material || !material.activo) throw new NotFoundException('MATERIAL_NOT_FOUND');
    return material;
  }

  async create(dto: CreateMaterialDto) {
    this.validarMaterial(dto);
    return this.repo.create(dto);
  }

  async update(id: string, dto: UpdateMaterialDto) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('MATERIAL_NOT_FOUND');

    const merged = { ...existing, ...dto };
    this.validarMaterial(merged as CreateMaterialDto);

    return this.repo.update(id, dto);
  }

  async softDelete(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('MATERIAL_NOT_FOUND');
    return this.repo.softDelete(id);
  }

  async resolver(dto: ResolverTextoDto): Promise<ResolverResultadoDto> {
    const resultado = await this.aliasResolver.resolver(dto.texto);
    return {
      estado: resultado.estado,
      materialId: resultado.material?.id ?? null,
      nombreOficial: resultado.material?.nombreOficial ?? null,
      candidatos: resultado.candidatos.map((c) => ({
        materialId: c.material.id,
        nombreOficial: c.material.nombreOficial,
        score: c.score,
        aliasCoincidente: c.aliasCoincidente,
      })),
      score: resultado.score,
      textoNormalizado: resultado.textoNormalizado,
    };
  }

  private validarMaterial(dto: CreateMaterialDto) {
    if (CANOS_EN_UNIDADES.includes(dto.categoria) && dto.unidadStock === 'UNIDAD') {
      if (!dto.longitudEstandar) {
        throw new UnprocessableEntityException('LONGITUD_REQUERIDA');
      }
    }

    if (dto.categoria === 'CANO_AGUA' && dto.unidadStock !== 'METRO') {
      throw new UnprocessableEntityException('UNIDAD_INVALIDA');
    }
  }
}
