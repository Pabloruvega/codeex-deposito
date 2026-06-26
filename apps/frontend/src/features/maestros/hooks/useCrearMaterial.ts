import { useMutation, useQueryClient } from '@tanstack/react-query'
import { maestrosService } from '../services/maestros.service'
import type { CreateMaterialDto } from '../types/maestros.types'

export function useCrearMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMaterialDto) => maestrosService.crearMaterial(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] })
    },
  })
}
