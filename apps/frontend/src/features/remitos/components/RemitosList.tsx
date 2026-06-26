'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useRemitos } from '../hooks/useRemitos'
import { useObras } from '@/features/maestros/hooks/useObras'
import { remitosService } from '../services/remitos.service'
import type { EstadoStock, RemitoSalidaLista } from '../types/remito.types'

const ESTADO_BADGE: Record<EstadoStock, { variant: 'warning' | 'success' | 'info'; label: string }> = {
  PENDIENTE: { variant: 'warning', label: 'Pendiente stock' },
  APLICADO: { variant: 'success', label: 'Aplicado' },
  STOCK_PENDIENTE: { variant: 'info', label: 'Reintentando…' },
}

interface Props {
  filtros?: { obraId?: string; fechaDesde?: string; fechaHasta?: string }
}

export function RemitosList({ filtros }: Props) {
  const { data: remitos = [], isLoading, isError } = useRemitos(filtros)
  const { data: obras = [] } = useObras()
  const [descargando, setDescargando] = useState<string | null>(null)

  const obraMap = Object.fromEntries(obras.map((o) => [o.id, o.nombre]))

  const handleDescargar = async (remito: RemitoSalidaLista) => {
    setDescargando(remito.id)
    try {
      await remitosService.descargarExcel(remito.id, remito.numeroRemito)
    } finally {
      setDescargando(null)
    }
  }

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Cargando remitos…</div>
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-sm text-destructive">
        Error al cargar remitos. Verificá que el servidor esté activo.
      </div>
    )
  }

  if (remitos.length === 0) {
    return (
      <div className="rounded-xl border border-border py-12 text-center text-sm text-muted-foreground">
        No hay remitos. Generá uno desde un pedido confirmado.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary text-xs font-medium uppercase text-muted-foreground">
            <th className="px-4 py-3 text-left">Nro.</th>
            <th className="px-4 py-3 text-left">Obra</th>
            <th className="px-4 py-3 text-left">Solicitante</th>
            <th className="px-4 py-3 text-left">Fecha retiro</th>
            <th className="px-4 py-3 text-left">Stock</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {remitos.map((remito) => {
            const badge = ESTADO_BADGE[remito.estadoStock]
            return (
              <tr
                key={remito.id}
                className="border-b border-border/50 transition-colors hover:bg-secondary"
              >
                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                  #{String(remito.numeroRemito).padStart(5, '0')}
                </td>
                <td className="px-4 py-3 font-medium text-foreground">
                  {obraMap[remito.obraId] ?? remito.obraId.slice(0, 8)}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{remito.solicitante}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(remito.fechaRetiroDeposito).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3">
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/remitos/${remito.id}`}
                      className="inline-flex h-7 items-center rounded-md px-2 text-xs font-medium text-foreground hover:bg-accent"
                    >
                      Ver
                    </Link>
                    <button
                      onClick={() => handleDescargar(remito)}
                      disabled={descargando === remito.id}
                      className="inline-flex h-7 items-center rounded-md px-2 text-xs font-medium text-foreground hover:bg-accent disabled:opacity-50"
                    >
                      {descargando === remito.id ? 'Descargando…' : 'Excel'}
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
