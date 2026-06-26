'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidos.service'

export function useSubirPedido() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (formData: FormData) => pedidosService.subirPedido(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    },
  })
}
