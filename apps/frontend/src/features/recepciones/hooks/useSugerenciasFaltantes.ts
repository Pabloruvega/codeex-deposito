'use client'

import { useQuery } from '@tanstack/react-query'
import { recepcionesService } from '../services/recepciones.service'

export function useSugerenciasFaltantes(id: string) {
  return useQuery({
    queryKey: ['sugerencias-faltantes', id],
    queryFn: () => recepcionesService.getSugerenciasFaltantes(id),
    enabled: !!id,
  })
}
