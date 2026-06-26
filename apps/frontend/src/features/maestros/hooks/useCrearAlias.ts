import { useMutation, useQueryClient } from '@tanstack/react-query'
import { maestrosService } from '../services/maestros.service'

export function useCrearAlias(materialId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (texto: string) => maestrosService.crearAlias(materialId, { texto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alias', materialId] })
    },
  })
}
