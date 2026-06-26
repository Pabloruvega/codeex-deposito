'use client'

import { useQuery } from '@tanstack/react-query'
import { faltantesService } from '../services/faltantes.service'

export function useFaltantesProveedor(filtros?: {
  proveedor?: string
  obraId?: string
  resuelto?: boolean
}) {
  return useQuery({
    queryKey: ['faltantes-proveedor', filtros],
    queryFn: () => faltantesService.getFaltantesProveedor(filtros),
  })
}
