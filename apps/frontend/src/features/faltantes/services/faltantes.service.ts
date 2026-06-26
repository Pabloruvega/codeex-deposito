import { api } from '@/lib/axios'
import type { FaltanteObra, FaltanteProveedor } from '../types/faltantes.types'

const getFaltantesObra = (params?: {
  obraId?: string
  estado?: string
}): Promise<FaltanteObra[]> =>
  api.get('/faltantes-obra', { params }).then((r) => r.data)

const actualizarEstadoFaltanteObra = (
  id: string,
  estado: string,
): Promise<FaltanteObra> =>
  api.patch(`/faltantes-obra/${id}/estado`, { estado }).then((r) => r.data)

const getFaltantesProveedor = (params?: {
  proveedor?: string
  obraId?: string
  resuelto?: boolean
}): Promise<FaltanteProveedor[]> =>
  api.get('/recepciones/faltantes', { params }).then((r) => r.data)

export const faltantesService = {
  getFaltantesObra,
  actualizarEstadoFaltanteObra,
  getFaltantesProveedor,
}
