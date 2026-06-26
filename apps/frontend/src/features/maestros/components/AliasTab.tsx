'use client'

import { useState } from 'react'
import { useMateriales } from '../hooks/useMateriales'
import { AliasTable } from './AliasTable'
import { Select } from '@/components/ui/select'

export function AliasTab() {
  const { data: materiales = [], isLoading } = useMateriales()
  const [materialId, setMaterialId] = useState<string>('')

  const materialSeleccionado = materiales.find((m) => m.id === materialId)

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Cargando...</div>
  }

  return (
    <div className="space-y-6">
      <div className="max-w-sm">
        <label className="block text-sm font-medium text-foreground mb-1">
          Seleccioná un material
        </label>
        <Select value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
          <option value="">— Elegir material —</option>
          {materiales.map((m) => (
            <option key={m.id} value={m.id}>
              {m.nombreOficial}
            </option>
          ))}
        </Select>
      </div>

      {materialSeleccionado ? (
        <AliasTable
          materialId={materialSeleccionado.id}
          materialNombre={materialSeleccionado.nombreOficial}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          Seleccioná un material para ver y gestionar sus alias
        </div>
      )}
    </div>
  )
}
