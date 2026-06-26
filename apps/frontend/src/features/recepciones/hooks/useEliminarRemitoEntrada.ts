'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recepcionesService } from '../services/recepciones.service'

export function useEliminarRemitoEntrada() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => recepcionesService.eliminarRemitoEntrada(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remitos-entrada'] })
    },
  })
}
