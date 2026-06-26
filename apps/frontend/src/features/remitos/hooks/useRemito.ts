'use client'

import { useQuery } from '@tanstack/react-query'
import { remitosService } from '../services/remitos.service'

export function useRemito(id: string) {
  return useQuery({
    queryKey: ['remitos', id],
    queryFn: () => remitosService.getRemito(id),
    enabled: !!id,
  })
}
