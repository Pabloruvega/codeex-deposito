'use client'

import { useState } from 'react'
import { RemitosList } from './RemitosList'
import { CrearRemitoModal } from './CrearRemitoModal'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useObras } from '@/features/maestros/hooks/useObras'

export function RemitosPageContent() {
  const [obraId, setObraId] = useState('')
  const [fechaDesde, setFechaDesde] = useState('')
  const [fechaHasta, setFechaHasta] = useState('')
  const { data: obras = [] } = useObras()

  const filtros = {
    ...(obraId ? { obraId } : {}),
    ...(fechaDesde ? { fechaDesde } : {}),
    ...(fechaHasta ? { fechaHasta } : {}),
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Remitos de salida</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Remitos generados a partir de pedidos confirmados
          </p>
        </div>
        <CrearRemitoModal />
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Select
          value={obraId}
          onChange={(e) => setObraId(e.target.value)}
          className="w-48"
        >
          <option value="">Todas las obras</option>
          {obras.map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombre}
            </option>
          ))}
        </Select>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Desde</span>
          <Input
            type="date"
            value={fechaDesde}
            onChange={(e) => setFechaDesde(e.target.value)}
            className="w-36"
          />
          <span>hasta</span>
          <Input
            type="date"
            value={fechaHasta}
            onChange={(e) => setFechaHasta(e.target.value)}
            className="w-36"
          />
        </div>
      </div>

      <RemitosList filtros={filtros} />
    </div>
  )
}
