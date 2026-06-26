export type EstadoStock = 'PENDIENTE' | 'APLICADO' | 'STOCK_PENDIENTE'

export interface ItemRemito {
  id: string
  remitoId: string
  materialId: string
  descripcion: string
  cantidadPedida: number
  unidad: string
  cantidadEnStock: number
  cantidadFaltante: number
  condicionEntrega?: string
  observaciones?: string
  material: { id: string; nombreOficial: string; unidadStock: string; categoria: string }
}

// Shape returned by GET /remitos-salida (list)
export interface RemitoSalidaLista {
  id: string
  pedidoId: string
  obraId: string
  numeroRemito: number
  solicitante: string
  encargadoDeposito: string
  encargadoTraslado: string
  fechaPedidoObra: string
  fechaRetiroDeposito: string
  archivoExcel: string
  estadoStock: EstadoStock
  intentosDescuento: number
  ultimoIntentoEn?: string | null
  pedido: { solicitante: string }
}

// Shape returned by GET /remitos-salida/:id (detail)
export interface RemitoSalidaDetalle extends Omit<RemitoSalidaLista, 'pedido'> {
  pedido: { obraId: string; solicitante: string; fechaPedido: string }
  items: ItemRemito[]
}

export interface CrearRemitoDto {
  pedidoId: string
  encargadoDeposito: string
  encargadoTraslado: string
  fechaRetiroDeposito: string
  items: {
    materialId: string
    cantidadPedida: number
    cantidadFaltante?: number
    observaciones?: string
  }[]
}
