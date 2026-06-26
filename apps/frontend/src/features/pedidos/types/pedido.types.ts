export type EstadoPedido = 'PENDIENTE_REVISION' | 'CONFIRMADO' | 'REMITO_GENERADO'
export type EstadoResolucion = 'RESUELTO_AUTOMATICO' | 'PENDIENTE_CONFIRMACION' | 'SIN_MATCH'

export interface ItemPedidoRaw {
  id: string
  pedidoId: string
  numeroItem: number
  textoOriginal: string
  cantidadOriginal: string
  cantidadNormalizada: number
  unidadPedido: string
  materialId: string | null
  estadoResolucion: EstadoResolucion
  scoreResolucion: number | null
  confirmadoPor: string | null
  material: { id: string; nombreOficial: string; categoria: string } | null
}

export interface PedidoRaw {
  id: string
  obraId: string
  solicitante: string
  fechaPedido: string
  fechaCarga: string
  archivoOriginal: string
  tipoArchivo: 'PDF' | 'IMAGEN'
  estado: EstadoPedido
  obra: { id: string; nombre: string; activa: boolean }
  // Lista: solo trae el count; detalle trae el array completo
  items?: ItemPedidoRaw[]
  _count?: { items: number }
  advertencias?: string[]
}

export interface ResumenResolucion {
  totalItems: number
  resueltosAutomatico: number
  pendientesConfirmacion: number
  sinMatch: number
}

export function computarResumen(items: ItemPedidoRaw[] | undefined | null): ResumenResolucion {
  const it = items ?? []
  return {
    totalItems: it.length,
    resueltosAutomatico: it.filter((i) => i.estadoResolucion === 'RESUELTO_AUTOMATICO').length,
    pendientesConfirmacion: it.filter((i) => i.estadoResolucion === 'PENDIENTE_CONFIRMACION').length,
    sinMatch: it.filter((i) => i.estadoResolucion === 'SIN_MATCH').length,
  }
}

export interface ResolverItemDto {
  materialId: string
  confirmadoPor: string
}
