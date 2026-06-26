'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidos.service'
import type { ResolverItemDto } from '../types/pedido.types'

export function useResolverItem(pedidoId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ itemId, dto }: { itemId: string; dto: ResolverItemDto }) =>
      pedidosService.resolverItem(pedidoId, itemId, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos', pedidoId] })
    },
  })
}
