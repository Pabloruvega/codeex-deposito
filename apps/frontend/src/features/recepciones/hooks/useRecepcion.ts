'use client'

import { useQuery } from '@tanstack/react-query'
import { recepcionesService } from '../services/recepciones.service'

export function useRecepcion(id: string) {
  return useQuery({
    queryKey: ['recepciones', id],
    queryFn: () => recepcionesService.getRecepcion(id),
    enabled: !!id,
  })
}
