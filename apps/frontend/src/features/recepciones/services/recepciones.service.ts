import { api } from '@/lib/axios'
import type {
  RemitoEntrada,
  Recepcion,
  FaltanteProveedor,
  CrearRemitoEntradaDto,
  CrearRecepcionDto,
  ActualizarCantidadesDto,
} from '../types/recepcion.types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const getRemitosEntrada = (params?: {
  obraId?: string
  proveedor?: string
}): Promise<RemitoEntrada[]> =>
  api.get('/remitos-entrada', { params }).then((r) => r.data)

const getRemitoEntrada = (id: string): Promise<RemitoEntrada> =>
  api.get(`/remitos-entrada/${id}`).then((r) => r.data)

const crearRemitoEntrada = (dto: CrearRemitoEntradaDto): Promise<RemitoEntrada> =>
  api.post('/remitos-entrada', dto).then((r) => r.data)

const eliminarRemitoEntrada = (id: string): Promise<{ eliminado: boolean }> =>
  api.delete(`/remitos-entrada/${id}`).then((r) => r.data)

const getRecepciones = (params?: {
  obraId?: string
  proveedor?: string
  estado?: string
}): Promise<Recepcion[]> =>
  api.get('/recepciones', { params }).then((r) => r.data)

const getRecepcion = (id: string): Promise<Recepcion> =>
  api.get(`/recepciones/${id}`).then((r) => r.data)

const crearRecepcion = (dto: CrearRecepcionDto): Promise<Recepcion> =>
  api.post('/recepciones', dto).then((r) => r.data)

const actualizarCantidades = (id: string, dto: ActualizarCantidadesDto): Promise<Recepcion> =>
  api.patch(`/recepciones/${id}/items`, dto).then((r) => r.data)

const getFaltantesProveedor = (params?: {
  proveedor?: string
  obraId?: string
  resuelto?: boolean
  fechaDesde?: string
  fechaHasta?: string
}): Promise<FaltanteProveedor[]> =>
  api.get('/recepciones/faltantes', { params }).then((r) => r.data)

const getSugerenciasFaltantes = (id: string): Promise<FaltanteProveedor[]> =>
  api.get(`/recepciones/${id}/sugerencias-faltantes`).then((r) => r.data)

const resolverFaltantes = (
  id: string,
  faltanteIds: string[],
): Promise<{ resueltos: number; items: FaltanteProveedor[] }> =>
  api.post(`/recepciones/${id}/resolver-faltantes`, { faltanteIds }).then((r) => r.data)

const exportarFaltantesExcel = async (params?: {
  proveedor?: string
  obraId?: string
}): Promise<void> => {
  const qs = new URLSearchParams({
    formato: 'EXCEL',
    ...(params?.proveedor ? { proveedor: params.proveedor } : {}),
    ...(params?.obraId ? { obraId: params.obraId } : {}),
  }).toString()
  const res = await fetch(`${BASE}/recepciones/faltantes?${qs}`)
  if (!res.ok) throw new Error('Error al descargar el reporte')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const fecha = new Date().toISOString().slice(0, 10)
  a.download = `faltantes-proveedor-${fecha}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const recepcionesService = {
  getRemitosEntrada,
  getRemitoEntrada,
  crearRemitoEntrada,
  eliminarRemitoEntrada,
  getRecepciones,
  getRecepcion,
  crearRecepcion,
  actualizarCantidades,
  getFaltantesProveedor,
  getSugerenciasFaltantes,
  resolverFaltantes,
  exportarFaltantesExcel,
}
