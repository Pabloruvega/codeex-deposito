import { Injectable } from '@nestjs/common';
import { StockRepository } from '../repositories/stock.repository';
import { ResultadoItemDescuento, ResultadoItemIngreso } from '../interfaces/resultado-descuento.interface';

@Injectable()
export class StockWriterService {
  constructor(private readonly repo: StockRepository) {}

  async descontar(obraId: string, proveedor: string, items: { materialId: string; cantidad: number }[]) {
    const resultados: ResultadoItemDescuento[] = [];
    for (const item of items) {
      const updated = await this.repo.upsertItem(obraId, proveedor, item.materialId, -item.cantidad);
      resultados.push({
        materialId: item.materialId,
        cantidadDescontada: item.cantidad,
        stockResultante: updated.cantidad,
        stockNegativo: updated.cantidad < 0,
      });
    }
    return resultados;
  }

  async ingresar(obraId: string, proveedor: string, items: { materialId: string; cantidad: number }[]) {
    const resultados: ResultadoItemIngreso[] = [];
    for (const item of items) {
      const updated = await this.repo.upsertItem(obraId, proveedor, item.materialId, item.cantidad);
      resultados.push({
        materialId: item.materialId,
        cantidadIngresada: item.cantidad,
        stockResultante: updated.cantidad,
      });
    }
    return resultados;
  }
}
