'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useObras } from '@/features/maestros/hooks/useObras'
import { useRemitosEntrada } from '../hooks/useRemitosEntrada'
import { useEliminarRemitoEntrada } from '../hooks/useEliminarRemitoEntrada'
import { RemitoEntradaForm } from './RemitoEntradaForm'

export function RemitosEntradaTab() {
  const [open, setOpen] = useState(false)
  const [obraId, setObraId] = useState('')
  const [proveedor, setProveedor] = useState('')

  const { data: obras = [] } = useObras()
  const filtros = {
    ...(obraId ? { obraId } : {}),
    ...(proveedor.trim() ? { proveedor: proveedor.trim() } : {}),
  }
  const { data: remitos = [], isLoading } = useRemitosEntrada(filtros)
  const { mutate: eliminar, isPending: eliminando } = useEliminarRemitoEntrada()

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
            placeholder="Filtrar por proveedor"
            value={proveedor}
            onChange={(e) => setProveedor(e.target.value)}
            className="h-10 w-48 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          Nuevo remito
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : remitos.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay remitos de entrada.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary text-xs font-medium uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">Obra</th>
                <th className="px-4 py-3 text-left">N° Remito</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Ítems</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {remitos.map((r) => (
                <tr key={r.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{r.proveedor}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.obra?.nombre ?? r.obraId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.numeroRemito}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.fechaRemito).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{r.items?.length ?? 0}</td>
                  <td className="px-4 py-3">
                    {r.asociadoARecepcion ? (
                      <Badge variant="success">Asociado</Badge>
                    ) : (
                      <Badge variant="inactive">Sin recepción</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => eliminar(r.id)}
                      disabled={r.asociadoARecepcion || eliminando}
                      className="text-xs text-destructive hover:text-destructive/80 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RemitoEntradaForm open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
