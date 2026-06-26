import { useMutation, useQueryClient } from '@tanstack/react-query'
import { maestrosService } from '../services/maestros.service'
import type { CreateObraProveedorDto } from '../types/maestros.types'

export function useAgregarProveedor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ obraId, data }: { obraId: string; data: CreateObraProveedorDto }) =>
      maestrosService.agregarProveedor(obraId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['obras'] })
    },
  })
}
