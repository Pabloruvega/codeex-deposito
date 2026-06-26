'use client'

import { useQuery } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidos.service'

export function usePedidos(filtros?: { obraId?: string; estado?: string }) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => pedidosService.getPedidos(filtros),
  })
}
