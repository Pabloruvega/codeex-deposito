import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const MATERIAL_SELECT = {
  id: true,
  nombreOficial: true,
  unidadStock: true,
  categoria: true,
} as const;

@Injectable()
export class StockRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByObraProveedor(obraId: string, proveedor: string) {
    try {
      return await this.prisma.stockItem.findMany({
        where: { obraId, proveedor },
        include: { material: { select: MATERIAL_SELECT } },
        orderBy: { material: { nombreOficial: 'asc' } },
      });
    } catch {
      throw new ServiceUnavailableException('STOCK_UNAVAILABLE');
    }
  }

  async findOne(obraId: string, proveedor: string, materialId: string) {
    try {
      return await this.prisma.stockItem.findUnique({
        where: { obraId_proveedor_materialId: { obraId, proveedor, materialId } },
        include: { material: { select: MATERIAL_SELECT } },
      });
    } catch {
      throw new ServiceUnavailableException('STOCK_UNAVAILABLE');
    }
  }

  async upsertItem(obraId: string, proveedor: string, materialId: string, delta: number) {
    try {
      return await this.prisma.stockItem.upsert({
        where: { obraId_proveedor_materialId: { obraId, proveedor, materialId } },
        create: { obraId, proveedor, materialId, cantidad: delta },
        update: { cantidad: { increment: delta } },
        include: { material: { select: MATERIAL_SELECT } },
      });
    } catch {
      throw new ServiceUnavailableException('STOCK_UNAVAILABLE');
    }
  }
}
