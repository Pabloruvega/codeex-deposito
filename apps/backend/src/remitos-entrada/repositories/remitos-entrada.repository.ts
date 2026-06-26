import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface FiltrosRemitoEntrada {
  obraId?: string;
  proveedor?: string;
}

export interface CreateRemitoEntradaData {
  obraId: string;
  proveedor: string;
  numeroRemito: string;
  fechaRemito: Date;
  items: Array<{
    codigoProveedor: string;
    descripcionProveedor: string;
    cantidad: number;
    unidad: string;
    materialId?: string | null;
  }>;
}

const INCLUDE_LISTA = {
  obra: { select: { id: true, nombre: true } },
  items: {
    select: {
      id: true,
      codigoProveedor: true,
      descripcionProveedor: true,
      cantidad: true,
      unidad: true,
      materialId: true,
    },
  },
} as const;

const INCLUDE_DETALLE = {
  obra: { select: { id: true, nombre: true } },
  items: {
    include: {
      material: {
        select: { id: true, nombreOficial: true, categoria: true, unidadStock: true },
      },
    },
  },
} as const;

@Injectable()
export class RemitosEntradaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filtros?: FiltrosRemitoEntrada) {
    const where: any = {};
    if (filtros?.obraId) where.obraId = filtros.obraId;
    if (filtros?.proveedor) where.proveedor = filtros.proveedor;
    return this.prisma.remitoEntrada.findMany({
      where,
      include: INCLUDE_LISTA,
      orderBy: { fechaCarga: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.remitoEntrada.findUnique({
      where: { id },
      include: INCLUDE_DETALLE,
    });
  }

  findDuplicado(proveedor: string, obraId: string, numeroRemito: string) {
    return this.prisma.remitoEntrada.findFirst({
      where: { proveedor, obraId, numeroRemito },
      select: { id: true },
    });
  }

  create(data: CreateRemitoEntradaData) {
    return this.prisma.remitoEntrada.create({
      data: {
        obraId: data.obraId,
        proveedor: data.proveedor,
        numeroRemito: data.numeroRemito,
        fechaRemito: data.fechaRemito,
        items: { create: data.items },
      },
      include: INCLUDE_DETALLE,
    });
  }

  delete(id: string) {
    return this.prisma.remitoEntrada.delete({ where: { id } });
  }
}
