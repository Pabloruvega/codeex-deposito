import { useMutation, useQueryClient } from '@tanstack/react-query'
import { maestrosService } from '../services/maestros.service'
import type { UpdateMaterialDto } from '../types/maestros.types'

export function useActualizarMaterial() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMaterialDto }) =>
      maestrosService.actualizarMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['materiales'] })
    },
  })
}
