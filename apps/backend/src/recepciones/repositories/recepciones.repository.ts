import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface FiltrosRecepcion {
  obraId?: string;
  proveedor?: string;
  estado?: string;
}

export interface CreateRecepcionData {
  obraId: string;
  proveedor: string;
  numeroRemito: string;
  numeroFactura: string;
  fechaRemito: Date;
  estado: 'COMPLETA' | 'CON_DIFERENCIAS';
  items: Array<{
    materialId: string;
    codigoProveedor: string;
    descripcionProveedor: string;
    cantidadFacturada: number;
    cantidadRecibida: number;
    diferencia: number;
    tieneFaltante: boolean;
  }>;
}

export interface UpdateItemData {
  cantidadRecibida: number;
  diferencia: number;
  tieneFaltante: boolean;
}

const INCLUDE_LISTA = {
  obra: { select: { id: true, nombre: true } },
} as const;

const INCLUDE_DETALLE = {
  obra: { select: { id: true, nombre: true } },
  items: {
    include: {
      material: { select: { id: true, nombreOficial: true, categoria: true, unidadStock: true } },
    },
  },
  faltantesProveedor: {
    include: {
      material: { select: { id: true, nombreOficial: true } },
    },
  },
} as const;

@Injectable()
export class RecepcionesRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filtros?: FiltrosRecepcion) {
    const where: any = {};
    if (filtros?.obraId) where.obraId = filtros.obraId;
    if (filtros?.proveedor) where.proveedor = filtros.proveedor;
    if (filtros?.estado) where.estado = filtros.estado;
    return this.prisma.recepcion.findMany({
      where,
      include: INCLUDE_LISTA,
      orderBy: { fechaRecepcion: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.recepcion.findUnique({
      where: { id },
      include: INCLUDE_DETALLE,
    });
  }

  create(data: CreateRecepcionData) {
    return this.prisma.recepcion.create({
      data: {
        obraId: data.obraId,
        proveedor: data.proveedor,
        numeroRemito: data.numeroRemito,
        numeroFactura: data.numeroFactura,
        fechaRemito: data.fechaRemito,
        estado: data.estado,
        items: { create: data.items },
      },
      include: INCLUDE_DETALLE,
    });
  }

  updateItem(itemId: string, data: UpdateItemData) {
    return this.prisma.itemRecepcion.update({
      where: { id: itemId },
      data,
    });
  }

  updateEstado(id: string, estado: 'COMPLETA' | 'CON_DIFERENCIAS') {
    return this.prisma.recepcion.update({
      where: { id },
      data: { estado },
      include: INCLUDE_DETALLE,
    });
  }
}
