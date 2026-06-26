'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { recepcionesService } from '../services/recepciones.service'

export function useResolverFaltantes() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, faltanteIds }: { id: string; faltanteIds: string[] }) =>
      recepcionesService.resolverFaltantes(id, faltanteIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faltantes-proveedor'] })
      queryClient.invalidateQueries({ queryKey: ['sugerencias-faltantes'] })
    },
  })
}
