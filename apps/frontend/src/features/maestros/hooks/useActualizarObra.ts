import { useMutation, useQueryClient } from '@tanstack/react-query'
import { maestrosService } from '../services/maestros.service'
import type { UpdateObraDto } from '../types/maestros.types'

export function useActualizarObra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateObraDto }) =>
      maestrosService.actualizarObra(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] })
    },
  })
}
