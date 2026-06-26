export type EstadoFaltanteObra = 'PENDIENTE' | 'EN_COMPRA' | 'RESUELTO'

export interface FaltanteObra {
  id: string
  obraId: string
  materialId: string
  descripcion: string
  cantidadPedida: number
  cantidadFaltante: number
  unidad: string
  estado: EstadoFaltanteObra
  observaciones: string | null
  creadoEn: string
  resueltaEn: string | null
  obra: { nombre: string }
  material: { nombreOficial: string }
}

export interface FaltanteProveedor {
  id: string
  proveedor: string
  obraId: string
  numeroFactura: string
  numeroRemito: string
  cantidadFacturada: number
  cantidadRecibida: number
  diferencia: number
  fechaRemito: string
  resuelto: boolean
  fechaResolucion: string | null
  material: { id: string; nombreOficial: string }
  recepcion?: { id: string; numeroFactura: string }
}
