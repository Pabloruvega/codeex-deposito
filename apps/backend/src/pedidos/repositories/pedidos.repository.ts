import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { EstadoResolucion, TipoArchivo } from '@prisma/client';

export interface CreatePedidoData {
  obraId: string;
  solicitante: string;
  fechaPedido: Date;
  archivoOriginal: string;
  tipoArchivo: TipoArchivo;
  items: {
    numeroItem: number;
    textoOriginal: string;
    cantidadOriginal: string;
    cantidadNormalizada: number;
    unidadPedido: string;
    materialId: string | null;
    estadoResolucion: EstadoResolucion;
    scoreResolucion: number | null;
  }[];
}

@Injectable()
export class PedidosRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filtros?: { obraId?: string; estado?: string }) {
    return this.prisma.pedido.findMany({
      where: {
        ...(filtros?.obraId && { obraId: filtros.obraId }),
        ...(filtros?.estado && { estado: filtros.estado as any }),
      },
      include: { obra: true, _count: { select: { items: true } } },
      orderBy: { fechaCarga: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.pedido.findUnique({
      where: { id },
      include: {
        obra: true,
        items: {
          include: { material: true },
          orderBy: { numeroItem: 'asc' },
        },
      },
    });
  }

  create(data: CreatePedidoData) {
    return this.prisma.pedido.create({
      data: {
        obraId: data.obraId,
        solicitante: data.solicitante,
        fechaPedido: data.fechaPedido,
        archivoOriginal: data.archivoOriginal,
        tipoArchivo: data.tipoArchivo,
        items: {
          create: data.items,
        },
      },
      include: {
        obra: true,
        items: {
          include: { material: true },
          orderBy: { numeroItem: 'asc' },
        },
      },
    });
  }

  updateItem(
    itemId: string,
    data: {
      materialId: string;
      estadoResolucion: EstadoResolucion;
      confirmadoPor?: string;
    },
  ) {
    return this.prisma.itemPedido.update({
      where: { id: itemId },
      data,
      include: { material: true },
    });
  }

  confirmar(id: string) {
    return this.prisma.pedido.update({
      where: { id },
      data: { estado: 'CONFIRMADO' },
      include: {
        obra: true,
        items: { include: { material: true }, orderBy: { numeroItem: 'asc' } },
      },
    });
  }
}
