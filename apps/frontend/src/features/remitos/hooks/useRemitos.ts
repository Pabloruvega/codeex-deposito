'use client'

import { useQuery } from '@tanstack/react-query'
import { remitosService } from '../services/remitos.service'

export function useRemitos(filtros?: {
  obraId?: string
  fechaDesde?: string
  fechaHasta?: string
}) {
  return useQuery({
    queryKey: ['remitos', filtros],
    queryFn: () => remitosService.getRemitos(filtros),
  })
}
