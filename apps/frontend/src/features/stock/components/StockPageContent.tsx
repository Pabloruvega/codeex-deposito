'use client'

import { useState } from 'react'
import { Select } from '@/components/ui/select'
import { useObras } from '@/features/maestros/hooks/useObras'
import { maestrosService } from '@/features/maestros/services/maestros.service'
import { useQuery } from '@tanstack/react-query'
import { StockTable } from './StockTable'

export function StockPageContent() {
  const [obraId, setObraId] = useState('')
  const [proveedor, setProveedor] = useState('')

  const { data: obras = [] } = useObras()

  const { data: obraConProveedores } = useQuery({
    queryKey: ['obras', obraId],
    queryFn: () => maestrosService.getObra(obraId),
    enabled: !!obraId,
  })

  const proveedores = obraConProveedores?.proveedores?.filter((p) => p.activo) ?? []

  const handleObraChange = (id: string) => {
    setObraId(id)
    setProveedor('')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Stock</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estado de stock por obra y proveedor
        </p>
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Select
          value={obraId}
          onChange={(e) => handleObraChange(e.target.value)}
          className="w-56"
        >
          <option value="">Seleccioná una obra…</option>
          {obras
            .filter((o) => o.activa)
            .map((o) => (
              <option key={o.id} value={o.id}>
                {o.nombre}
              </option>
            ))}
        </Select>

        <Select
          value={proveedor}
          onChange={(e) => setProveedor(e.target.value)}
          disabled={!obraId || proveedores.length === 0}
          className="w-56"
        >
          <option value="">Seleccioná un proveedor…</option>
          {proveedores.map((p) => (
            <option key={p.id} value={p.proveedor}>
              {p.proveedor}
            </option>
          ))}
        </Select>
      </div>

      {!obraId && (
        <div className="rounded-xl border border-border py-12 text-center text-sm text-muted-foreground">
          Seleccioná una obra para ver el stock.
        </div>
      )}

      {obraId && !proveedor && proveedores.length > 0 && (
        <div className="rounded-xl border border-border py-12 text-center text-sm text-muted-foreground">
          Seleccioná un proveedor.
        </div>
      )}

      {obraId && !proveedor && proveedores.length === 0 && obraConProveedores && (
        <div className="rounded-xl border border-border py-12 text-center text-sm text-muted-foreground">
          Esta obra no tiene proveedores activos configurados.
        </div>
      )}

      {obraId && proveedor && (
        <StockTable obraId={obraId} proveedor={proveedor} />
      )}
    </div>
  )
}
