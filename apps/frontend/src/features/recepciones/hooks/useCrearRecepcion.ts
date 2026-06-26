'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recepcionesService } from '../services/recepciones.service'
import type { CrearRecepcionDto } from '../types/recepcion.types'

export function useCrearRecepcion() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CrearRecepcionDto) => recepcionesService.crearRecepcion(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recepciones'] })
    },
  })
}
