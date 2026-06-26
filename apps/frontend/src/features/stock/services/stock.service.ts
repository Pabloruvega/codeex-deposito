import { api } from '@/lib/axios'
import type { StockItem } from '../types/stock.types'

const getStock = (obraId: string, proveedor: string): Promise<StockItem[]> =>
  api.get(`/stock/${encodeURIComponent(obraId)}/${encodeURIComponent(proveedor)}`).then((r) => r.data)

const getStockItem = (obraId: string, proveedor: string, materialId: string): Promise<StockItem> =>
  api
    .get(`/stock/${encodeURIComponent(obraId)}/${encodeURIComponent(proveedor)}/${encodeURIComponent(materialId)}`)
    .then((r) => r.data)

export const stockService = {
  getStock,
  getStockItem,
}
