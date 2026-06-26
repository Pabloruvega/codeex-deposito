import { useMutation, useQueryClient } from '@tanstack/react-query'
import { maestrosService } from '../services/maestros.service'

export function useEliminarAlias(materialId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (aliasId: string) => maestrosService.eliminarAlias(aliasId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alias', materialId] })
    },
  })
}
