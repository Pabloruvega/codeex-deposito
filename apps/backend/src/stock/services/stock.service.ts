import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StockReaderService } from './stock-reader.service';
import { StockWriterService } from './stock-writer.service';
import { DescuentoStockDto } from '../dto/descuento-stock.dto';
import { IngresoStockDto } from '../dto/stock-item.dto';

@Injectable()
export class StockService {
  constructor(
    private readonly reader: StockReaderService,
    private readonly writer: StockWriterService,
    private readonly prisma: PrismaService,
  ) {}

  async getStockObra(obraId: string, proveedor: string) {
    await this.validarObra(obraId);
    return this.reader.getStockObra(obraId, proveedor);
  }

  async getStockMaterial(obraId: string, proveedor: string, materialId: string) {
    await this.validarObra(obraId);
    await this.validarMaterial(materialId);
    const item = await this.reader.getStockMaterial(obraId, proveedor, materialId);
    return item ?? { obraId, proveedor, materialId, cantidad: 0, material: null };
  }

  async descontar(obraId: string, proveedor: string, dto: DescuentoStockDto) {
    await this.validarObra(obraId);
    await this.validarMateriales(dto.items.map((i) => i.materialId));

    const resultados = await this.writer.descontar(obraId, proveedor, dto.items);

    const advertencias: string[] = [];
    for (const r of resultados) {
      if (r.stockNegativo) {
        advertencias.push(`STOCK_NEGATIVO: material ${r.materialId} quedó en ${r.stockResultante}`);
      }
    }

    return { procesados: resultados.length, advertencias, items: resultados };
  }

  async ingresar(obraId: string, proveedor: string, dto: IngresoStockDto) {
    await this.validarObra(obraId);
    await this.validarMateriales(dto.items.map((i) => i.materialId));

    const resultados = await this.writer.ingresar(obraId, proveedor, dto.items);
    return { procesados: resultados.length, items: resultados };
  }

  private async validarObra(obraId: string) {
    const obra = await this.prisma.obra.findUnique({ where: { id: obraId } });
    if (!obra) throw new NotFoundException('OBRA_NOT_FOUND');
  }

  private async validarMaterial(materialId: string) {
    const material = await this.prisma.material.findUnique({ where: { id: materialId } });
    if (!material) throw new NotFoundException('MATERIAL_NOT_FOUND');
  }

  private async validarMateriales(materialIds: string[]) {
    for (const id of materialIds) {
      await this.validarMaterial(id);
    }
  }
}
