import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { FaltantesObraRepository, CreateFaltanteObraData } from '../repositories/faltantes-obra.repository';
import { UpdateFaltanteObraDto } from '../dto/update-faltante-obra.dto';

const TRANSICIONES_VALIDAS: Record<string, string[]> = {
  PENDIENTE: ['EN_COMPRA'],
  EN_COMPRA: ['RESUELTO'],
  RESUELTO: [],
};

@Injectable()
export class FaltantesObraService {
  constructor(private readonly repository: FaltantesObraRepository) {}

  findAll(filtros?: { obraId?: string; estado?: string; fechaDesde?: string; fechaHasta?: string }) {
    return this.repository.findAll(filtros);
  }

  async findById(id: string) {
    const faltante = await this.repository.findById(id);
    if (!faltante) throw new NotFoundException('FALTANTE_OBRA_NOT_FOUND');
    return faltante;
  }

  async updateEstado(id: string, dto: UpdateFaltanteObraDto) {
    const faltante = await this.repository.findById(id);
    if (!faltante) throw new NotFoundException('FALTANTE_OBRA_NOT_FOUND');

    const transicionesValidas = TRANSICIONES_VALIDAS[faltante.estado] ?? [];
    if (!transicionesValidas.includes(dto.estado)) {
      throw new UnprocessableEntityException('ESTADO_INVALIDO');
    }

    const resueltaEn = dto.estado === 'RESUELTO' ? new Date() : undefined;
    return this.repository.updateEstado(id, dto.estado, resueltaEn);
  }

  crear(data: CreateFaltanteObraData) {
    return this.repository.create(data);
  }
}
