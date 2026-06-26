'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidos.service'

export function useConfirmarPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (pedidoId: string) => pedidosService.confirmarPedido(pedidoId),
    onSuccess: (_data, pedidoId) => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
      queryClient.invalidateQueries({ queryKey: ['pedidos', pedidoId] })
    },
  })
}
