'use client'

import { useState } from 'react'
import { Select } from '@/components/ui/select'
import { useObras } from '@/features/maestros/hooks/useObras'
import { useFaltantesObra } from '../hooks/useFaltantesObra'
import { FaltantesObraTable } from './FaltantesObraTable'

export function FaltantesObraTab() {
  const [obraId, setObraId] = useState('')
  const [estado, setEstado] = useState('')

  const { data: obras = [] } = useObras()
  const filtros = {
    ...(obraId ? { obraId } : {}),
    ...(estado ? { estado } : {}),
  }
  const { data: faltantes = [], isLoading } = useFaltantesObra(filtros)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={obraId}
          onChange={(e) => setObraId(e.target.value)}
          className="w-44"
        >
          <option value="">Todas las obras</option>
          {obras.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombre}
            </option>
          ))}
        </Select>
        <Select
          value={estado}
          onChange={(e) => setEstado(e.target.value)}
          className="w-44"
        >
          <option value="">Todos los estados</option>
          <option value="PENDIENTE">Pendiente</option>
          <option value="EN_COMPRA">En compra</option>
          <option value="RESUELTO">Resuelto</option>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <FaltantesObraTable faltantes={faltantes} />
      )}
    </div>
  )
}
