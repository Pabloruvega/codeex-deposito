'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { faltantesService } from '../services/faltantes.service'

export function useActualizarFaltanteObra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: string }) =>
      faltantesService.actualizarEstadoFaltanteObra(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faltantes-obra'] })
    },
  })
}
