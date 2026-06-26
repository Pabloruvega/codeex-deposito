import { useQuery } from '@tanstack/react-query'
import { maestrosService } from '../services/maestros.service'

export function useObras() {
  return useQuery({
    queryKey: ['obras'],
    queryFn: maestrosService.getObras,
  })
}
