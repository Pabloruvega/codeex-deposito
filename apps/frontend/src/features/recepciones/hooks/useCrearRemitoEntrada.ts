'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recepcionesService } from '../services/recepciones.service'
import type { CrearRemitoEntradaDto } from '../types/recepcion.types'

export function useCrearRemitoEntrada() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (dto: CrearRemitoEntradaDto) => recepcionesService.crearRemitoEntrada(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['remitos-entrada'] })
    },
  })
}
