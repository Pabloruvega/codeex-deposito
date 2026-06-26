import { api } from '@/lib/axios'
import type { RemitoSalidaLista, RemitoSalidaDetalle, CrearRemitoDto } from '../types/remito.types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const getRemitos = (params?: {
  obraId?: string
  fechaDesde?: string
  fechaHasta?: string
}): Promise<RemitoSalidaLista[]> => api.get('/remitos-salida', { params }).then((r) => r.data)

const getRemito = (id: string): Promise<RemitoSalidaDetalle> =>
  api.get(`/remitos-salida/${id}`).then((r) => r.data)

const crearRemito = (dto: CrearRemitoDto): Promise<RemitoSalidaDetalle> =>
  api.post('/remitos-salida', dto).then((r) => r.data)

const descargarExcel = async (id: string, numeroRemito: number): Promise<void> => {
  const res = await fetch(`${BASE}/remitos-salida/${id}/descargar`)
  if (!res.ok) throw new Error('Error al descargar el archivo')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const disposition = res.headers.get('content-disposition') ?? ''
  const match = disposition.match(/filename="(.+)"/)
  a.download = match?.[1] ?? `remito-${String(numeroRemito).padStart(5, '0')}.xlsx`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const remitosService = {
  getRemitos,
  getRemito,
  crearRemito,
  descargarExcel,
}
