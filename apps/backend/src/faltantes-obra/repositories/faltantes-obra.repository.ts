import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateFaltanteObraData {
  remitoSalidaId: string;
  itemRemitoId: string;
  obraId: string;
  materialId: string;
  descripcion: string;
  cantidadPedida: number;
  cantidadFaltante: number;
  unidad: string;
}

interface FiltrosFaltante {
  obraId?: string;
  estado?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

const INCLUDE_COMPLETO = {
  obra: { select: { id: true, nombre: true } },
  material: { select: { id: true, nombreOficial: true, categoria: true } },
  itemRemito: { select: { id: true, cantidadPedida: true, unidad: true } },
} as const;

@Injectable()
export class FaltantesObraRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filtros?: FiltrosFaltante) {
    const where: any = {};
    if (filtros?.obraId) where.obraId = filtros.obraId;
    if (filtros?.estado) where.estado = filtros.estado;
    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.creadoEn = {};
      if (filtros.fechaDesde) where.creadoEn.gte = new Date(filtros.fechaDesde);
      if (filtros.fechaHasta) where.creadoEn.lte = new Date(filtros.fechaHasta);
    }
    return this.prisma.faltanteObra.findMany({
      where,
      include: INCLUDE_COMPLETO,
      orderBy: { creadoEn: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.faltanteObra.findUnique({
      where: { id },
      include: INCLUDE_COMPLETO,
    });
  }

  create(data: CreateFaltanteObraData) {
    return this.prisma.faltanteObra.create({ data });
  }

  updateEstado(id: string, estado: string, resueltaEn?: Date) {
    return this.prisma.faltanteObra.update({
      where: { id },
      data: { estado: estado as any, ...(resueltaEn ? { resueltaEn } : {}) },
      include: INCLUDE_COMPLETO,
    });
  }
}
