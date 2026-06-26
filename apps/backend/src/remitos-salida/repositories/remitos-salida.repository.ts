import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface CreateRemitoData {
  pedidoId: string;
  obraId: string;
  numeroRemito: number;
  solicitante: string;
  encargadoDeposito: string;
  encargadoTraslado: string;
  fechaPedidoObra: Date;
  fechaRetiroDeposito: Date;
  archivoExcel: string;
  items: {
    materialId: string;
    descripcion: string;
    cantidadPedida: number;
    unidad: string;
    cantidadEnStock: number;
    cantidadFaltante: number;
    condicionEntrega: string;
    observaciones?: string;
  }[];
}

interface FiltrosRemito {
  obraId?: string;
  fechaDesde?: string;
  fechaHasta?: string;
}

const INCLUDE_LISTA = {
  pedido: { select: { solicitante: true } },
} as const;

const INCLUDE_DETALLE = {
  pedido: { select: { obraId: true, solicitante: true, fechaPedido: true } },
  items: {
    include: {
      material: { select: { id: true, nombreOficial: true, unidadStock: true, categoria: true } },
      faltanteObra: true,
    },
  },
} as const;

@Injectable()
export class RemitosSalidaRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filtros?: FiltrosRemito) {
    const where: any = {};
    if (filtros?.obraId) where.obraId = filtros.obraId;
    if (filtros?.fechaDesde || filtros?.fechaHasta) {
      where.fechaRetiroDeposito = {};
      if (filtros.fechaDesde) where.fechaRetiroDeposito.gte = new Date(filtros.fechaDesde);
      if (filtros.fechaHasta) where.fechaRetiroDeposito.lte = new Date(filtros.fechaHasta);
    }
    return this.prisma.remitoSalida.findMany({
      where,
      include: INCLUDE_LISTA,
      orderBy: { numeroRemito: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.remitoSalida.findUnique({
      where: { id },
      include: INCLUDE_DETALLE,
    });
  }

  create(data: CreateRemitoData) {
    return this.prisma.remitoSalida.create({
      data: {
        pedidoId: data.pedidoId,
        obraId: data.obraId,
        numeroRemito: data.numeroRemito,
        solicitante: data.solicitante,
        encargadoDeposito: data.encargadoDeposito,
        encargadoTraslado: data.encargadoTraslado,
        fechaPedidoObra: data.fechaPedidoObra,
        fechaRetiroDeposito: data.fechaRetiroDeposito,
        archivoExcel: data.archivoExcel,
        items: { create: data.items },
      },
      include: INCLUDE_DETALLE,
    });
  }

  updateEstadoStock(id: string, estadoStock: 'PENDIENTE' | 'APLICADO' | 'STOCK_PENDIENTE') {
    return this.prisma.remitoSalida.update({
      where: { id },
      data: { estadoStock: estadoStock as any, ultimoIntentoEn: new Date() },
    });
  }

  incrementarIntentos(id: string) {
    return this.prisma.remitoSalida.update({
      where: { id },
      data: { intentosDescuento: { increment: 1 }, ultimoIntentoEn: new Date() },
    });
  }
}
