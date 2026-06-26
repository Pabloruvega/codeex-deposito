'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recepcionesService } from '../services/recepciones.service'
import type { ActualizarCantidadesDto } from '../types/recepcion.types'

export function useActualizarCantidades() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: ActualizarCantidadesDto }) =>
      recepcionesService.actualizarCantidades(id, dto),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['recepciones', id] })
      queryClient.invalidateQueries({ queryKey: ['recepciones'] })
    },
  })
}
