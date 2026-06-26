'use client'

import { useQuery } from '@tanstack/react-query'
import { stockService } from '../services/stock.service'

export function useStock(obraId: string | null, proveedor: string | null) {
  return useQuery({
    queryKey: ['stock', obraId, proveedor],
    queryFn: () => stockService.getStock(obraId!, proveedor!),
    enabled: !!obraId && !!proveedor,
  })
}
