export interface StockItem {
  id: string
  obraId: string
  proveedor: string
  materialId: string
  cantidad: number
  creadoEn: string
  actualizadoEn: string
  material: {
    id: string
    nombreOficial: string
    categoria: string
    unidadStock: string
  }
  obra?: { id: string; nombre: string }
}

export interface IngresoStockDto {
  items: { materialId: string; cantidad: number }[]
}

export interface DescuentoStockDto {
  items: { materialId: string; cantidad: number }[]
}
