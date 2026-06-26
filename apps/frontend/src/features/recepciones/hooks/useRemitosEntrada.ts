'use client'

import { useQuery } from '@tanstack/react-query'
import { recepcionesService } from '../services/recepciones.service'

export function useRemitosEntrada(filtros?: { obraId?: string; proveedor?: string }) {
  return useQuery({
    queryKey: ['remitos-entrada', filtros],
    queryFn: () => recepcionesService.getRemitosEntrada(filtros),
  })
}
