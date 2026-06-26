import { useMutation, useQueryClient } from '@tanstack/react-query'
import { maestrosService } from '../services/maestros.service'
import type { CreateObraDto } from '../types/maestros.types'

export function useCrearObra() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateObraDto) => maestrosService.crearObra(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] })
    },
  })
}
