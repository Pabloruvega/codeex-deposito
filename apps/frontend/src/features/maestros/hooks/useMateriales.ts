import { useQuery } from '@tanstack/react-query'
import { maestrosService } from '../services/maestros.service'

export function useMateriales() {
  return useQuery({
    queryKey: ['materiales'],
    queryFn: maestrosService.getMateriales,
  })
}
