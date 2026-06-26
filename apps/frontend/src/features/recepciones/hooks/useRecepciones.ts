'use client'

import { useQuery } from '@tanstack/react-query'
import { recepcionesService } from '../services/recepciones.service'

export function useRecepciones(filtros?: {
  obraId?: string
  proveedor?: string
  estado?: string
}) {
  return useQuery({
    queryKey: ['recepciones', filtros],
    queryFn: () => recepcionesService.getRecepciones(filtros),
  })
}
