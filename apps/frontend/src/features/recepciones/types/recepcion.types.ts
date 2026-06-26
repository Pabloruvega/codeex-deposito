export interface RemitoEntrada {
  id: string
  obraId: string
  proveedor: string
  numeroRemito: string
  fechaRemito: string
  fechaCarga: string
  asociadoARecepcion: boolean
  obra?: { id: string; nombre: string }
  items: ItemRemitoEntrada[]
}

export interface ItemRemitoEntrada {
  id: string
  codigoProveedor: string
  descripcionProveedor: string
  cantidad: number
  unidad: string | null
  materialId: string | null
}

export interface Recepcion {
  id: string
  obraId: string
  proveedor: string
  numeroRemito: string
  numeroFactura: string
  fechaRemito: string
  fechaRecepcion: string
  estado: 'COMPLETA' | 'CON_DIFERENCIAS'
  obra?: { id: string; nombre: string }
  items: ItemRecepcion[]
  faltantesProveedor?: FaltanteProveedor[]
}

export interface ItemRecepcion {
  id: string
  codigoProveedor: string
  descripcionProveedor: string
  cantidadFacturada: number
  cantidadRecibida: number
  diferencia: number
  tieneFaltante: boolean
  materialId: string
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

export interface CrearRemitoEntradaDto {
  obraId: string
  proveedor: string
  numeroRemito: string
  fechaRemito: string
  items: {
    codigoProveedor: string
    descripcionProveedor: string
    cantidad: number
    unidad?: string
  }[]
}

export interface CrearRecepcionDto {
  obraId: string
  proveedor: string
  numeroRemito: string
  numeroFactura: string
  fechaRemito: string
  items: {
    codigoProveedor: string
    descripcionProveedor: string
    cantidadFacturada: number
    cantidadRecibida: number
  }[]
}

export interface ActualizarCantidadesDto {
  items: {
    itemId: string
    cantidadRecibida: number
  }[]
}
