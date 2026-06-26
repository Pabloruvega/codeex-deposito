'use client'

import { useQuery } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidos.service'

export function usePedido(id: string) {
  return useQuery({
    queryKey: ['pedidos', id],
    queryFn: () => pedidosService.getPedido(id),
    enabled: !!id,
  })
}
