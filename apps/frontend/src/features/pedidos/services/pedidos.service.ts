import { api } from '@/lib/axios'
import type { PedidoRaw, ResolverItemDto } from '../types/pedido.types'
import type { Material } from '@/features/maestros/types/maestros.types'

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

const getPedidos = (params?: { obraId?: string; estado?: string }): Promise<PedidoRaw[]> =>
  api.get('/pedidos', { params }).then((r) => r.data)

const getPedido = (id: string): Promise<PedidoRaw> =>
  api.get(`/pedidos/${id}`).then((r) => r.data)

// Usa fetch para que el browser añada Content-Type multipart/form-data con boundary
const subirPedido = async (formData: FormData): Promise<PedidoRaw> => {
  const res = await fetch(`${BASE}/pedidos`, { method: 'POST', body: formData })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as any).message ?? 'Error al subir el pedido')
  }
  return res.json() as Promise<PedidoRaw>
}

const resolverItem = (
  pedidoId: string,
  itemId: string,
  dto: ResolverItemDto,
): Promise<unknown> => api.patch(`/pedidos/${pedidoId}/items/${itemId}`, dto).then((r) => r.data)

const confirmarPedido = (id: string): Promise<PedidoRaw> =>
  api.post(`/pedidos/${id}/confirmar`, {}).then((r) => r.data)

const getMateriales = (): Promise<Material[]> =>
  api.get('/materiales').then((r) => r.data)

export const pedidosService = {
  getPedidos,
  getPedido,
  subirPedido,
  resolverItem,
  confirmarPedido,
  getMateriales,
}
