'use client'

import { useState } from 'react'
import { Select } from '@/components/ui/select'
import { useObras } from '@/features/maestros/hooks/useObras'
import { useFaltantesProveedor } from '../hooks/useFaltantesProveedor'
import { FaltantesProveedorTable } from './FaltantesProveedorTable'
import { ExportarFaltantesButton } from './ExportarFaltantesButton'

export function FaltantesProveedorTab() {
  const [obraId, setObraId] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [soloPendientes, setSoloPendientes] = useState(false)

  const { data: obras = [] } = useObras()
  const filtros = {
    ...(obraId ? { obraId } : {}),
    ...(proveedor.trim() ? { proveedor: proveedor.trim() } : {}),
    ...(soloPendientes ? { resuelto: false } : {}),
  }
  const { data: faltantes = [], isLoading } = useFaltantesProveedor(filtros)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
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
          <input
            type="text"
            placeholder="Filtrar proveedor"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            className="h-10 w-44 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="checkbox"
              checked={soloPendientes}
              onChange={(e) => setSoloPendientes(e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Solo pendientes
          </label>
        </div>
        <ExportarFaltantesButton
          proveedor={proveedor.trim() || undefined}
          obraId={obraId || undefined}
        />
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : (
        <FaltantesProveedorTable faltantes={faltantes} />
      )}
    </div>
  )
}
