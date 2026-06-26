import { Injectable } from '@nestjs/common';
import { StockRepository } from '../repositories/stock.repository';

@Injectable()
export class StockReaderService {
  constructor(private readonly repo: StockRepository) {}

  getStockObra(obraId: string, proveedor: string) {
    return this.repo.findByObraProveedor(obraId, proveedor);
  }

  getStockMaterial(obraId: string, proveedor: string, materialId: string) {
    return this.repo.findOne(obraId, proveedor, materialId);
  }
}
