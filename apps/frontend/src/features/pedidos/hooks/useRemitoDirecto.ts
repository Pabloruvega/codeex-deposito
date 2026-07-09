'use client'

import { useMutation } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidos.service'

export function useRemitoDirecto() {
  return useMutation({
    mutationFn: (formData: FormData) => pedidosService.generarRemitoDirecto(formData),
  })
}
