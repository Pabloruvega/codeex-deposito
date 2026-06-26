'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { remitosService } from '../services/remitos.service'
import type { CrearRemitoDto } from '../types/remito.types'

export function useCrearRemito() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CrearRemitoDto) => remitosService.crearRemito(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remitos'] })
      queryClient.invalidateQueries({ queryKey: ['pedidos'] })
    },
  })
}
