import { useQuery } from '@tanstack/react-query'
import { maestrosService } from '../services/maestros.service'

export function useAlias(materialId: string | null) {
  return useQuery({
    queryKey: ['alias', materialId],
    queryFn: () => maestrosService.getAlias(materialId!),
    enabled: !!materialId,
  })
}
