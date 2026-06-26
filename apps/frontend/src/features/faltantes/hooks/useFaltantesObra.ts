'use client'

import { useQuery } from '@tanstack/react-query'
import { faltantesService } from '../services/faltantes.service'

export function useFaltantesObra(filtros?: { obraId?: string; estado?: string }) {
  return useQuery({
    queryKey: ['faltantes-obra', filtros],
    queryFn: () => faltantesService.getFaltantesObra(filtros),
  })
}
