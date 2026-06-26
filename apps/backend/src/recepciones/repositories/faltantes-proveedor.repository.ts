import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface FiltrosFaltanteProveedor {
  proveedor?: string;
  obraId?: string;
  resuelto?: boolean;
  fechaDesde?: string;
  fechaHasta?: string;
}

interface FiltrosSugerencia {
  proveedor: string;
  obraId: string;
  materialIds: string[];
}

export interface CreateFaltanteProveedorData {
  recepcionId: string;
  obraId: string;
  proveedor: string;
  numeroFactura: string;
  numeroRemito: string;
  materialId: string;
  cantidadFacturada: number;
  cantidadRecibida: number;
  diferencia: number;
  fechaRemito: Date;
}

const INCLUDE_COMPLETO = {
  material: { select: { id: true, nombreOficial: true, categoria: true, unidadStock: true } },
  recepcion: { select: { id: true, numeroFactura: true, numeroRemito: true } },
} as const;

@Injectable()
export class FaltantesProveedorRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filtros?: FiltrosFaltanteProveedor) {
    const where: any = {};
    if (filtros?.proveedor) where.proveedor = filtros.proveedor;
    if (filtros?.obraId) where.obraId = filtros.obraId;
    if (filtros?.resuelto !== undefined) where.resuelto = filtros.resuelto;
    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fechaRemito = {};
      if (filtros.fechaDesde) where.fechaRemito.gte = new Date(filtros.fechaDesde);
      if (filtros.fechaHasta) where.fechaRemito.lte = new Date(filtros.fechaHasta);
    }
    return this.prisma.faltanteProveedor.findMany({
      where,
      include: INCLUDE_COMPLETO,
      orderBy: { fechaRemito: 'desc' },
    });
  }

  findPendientesParaSugerencia(filtros: FiltrosSugerencia) {
    return this.prisma.faltanteProveedor.findMany({
      where: {
        proveedor: filtros.proveedor,
        obraId: filtros.obraId,
        materialId: { in: filtros.materialIds },
        resuelto: false,
      },
      include: INCLUDE_COMPLETO,
    });
  }

  create(data: CreateFaltanteProveedorData) {
    return this.prisma.faltanteProveedor.create({ data, include: INCLUDE_COMPLETO });
  }

  resolver(id: string, fechaResolucion: Date) {
    return this.prisma.faltanteProveedor.update({
      where: { id },
      data: { resuelto: true, fechaResolucion },
      include: INCLUDE_COMPLETO,
    });
  }
}
