'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useObras } from '@/features/maestros/hooks/useObras'
import { useRecepciones } from '../hooks/useRecepciones'
import { RecepcionForm } from './RecepcionForm'

export function RecepcionesTab() {
  const [open, setOpen] = useState(false)
  const [obraId, setObraId] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [estado, setEstado] = useState('')

  const { data: obras = [] } = useObras()
  const filtros = {
    ...(obraId ? { obraId } : {}),
    ...(proveedor.trim() ? { proveedor: proveedor.trim() } : {}),
    ...(estado ? { estado } : {}),
  }
  const { data: recepciones = [], isLoading } = useRecepciones(filtros)

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
          <Select
            value={estado}
            onChange={(e) => setEstado(e.target.value)}
            className="w-44"
          >
            <option value="">Todos los estados</option>
            <option value="COMPLETA">Completa</option>
            <option value="CON_DIFERENCIAS">Con diferencias</option>
          </Select>
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          Nueva recepción
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando…</p>
      ) : recepciones.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay recepciones registradas.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary text-xs font-medium uppercase text-muted-foreground">
                <th className="px-4 py-3 text-left">Proveedor</th>
                <th className="px-4 py-3 text-left">Obra</th>
                <th className="px-4 py-3 text-left">N° Factura</th>
                <th className="px-4 py-3 text-left">N° Remito</th>
                <th className="px-4 py-3 text-left">Fecha</th>
                <th className="px-4 py-3 text-left">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {recepciones.map((r) => (
                <tr key={r.id} className="border-b border-border/50 last:border-0">
                  <td className="px-4 py-3 font-medium text-foreground">{r.proveedor}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.obra?.nombre ?? r.obraId}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.numeroFactura}</td>
                  <td className="px-4 py-3 text-muted-foreground">{r.numeroRemito}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(r.fechaRecepcion).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3">
                    {r.estado === 'COMPLETA' ? (
                      <Badge variant="success">Completa</Badge>
                    ) : (
                      <Badge variant="warning">Con diferencias</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/recepciones/${r.id}`}
                      className="text-xs font-medium text-foreground hover:underline"
                    >
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <RecepcionForm open={open} onClose={() => setOpen(false)} />
    </div>
  )
}
