'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useRemito } from '../hooks/useRemito'
import { remitosService } from '../services/remitos.service'
import type { EstadoStock } from '../types/remito.types'

const ESTADO_BADGE: Record<EstadoStock, { variant: 'warning' | 'success' | 'info'; label: string }> = {
  PENDIENTE: { variant: 'warning', label: 'Pendiente stock' },
  APLICADO: { variant: 'success', label: 'Stock aplicado' },
  STOCK_PENDIENTE: { variant: 'info', label: 'Reintentando descuento…' },
}

interface Props {
  id: string
}

export function RemitoDetalle({ id }: Props) {
  const { data: remito, isLoading, isError } = useRemito(id)
  const [descargando, setDescargando] = useState(false)

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Cargando remito…</div>
  }

  if (isError || !remito) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-destructive">No se encontró el remito.</p>
        <Link
          href="/remitos"
          className="mt-4 inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-secondary"
        >
          Volver a remitos
        </Link>
      </div>
    )
  }

  const badge = ESTADO_BADGE[remito.estadoStock]

  const handleDescargar = async () => {
    setDescargando(true)
    try {
      await remitosService.descargarExcel(remito.id, remito.numeroRemito)
    } finally {
      setDescargando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">
              Remito #{String(remito.numeroRemito).padStart(5, '0')}
            </h1>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Solicitante: <strong>{remito.solicitante}</strong>
            {' '}· Retiro:{' '}
            {new Date(remito.fechaRetiroDeposito).toLocaleDateString('es-AR')}
            {' '}· Pedido:{' '}
            {new Date(remito.fechaPedidoObra).toLocaleDateString('es-AR')}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Encargado depósito: {remito.encargadoDeposito}
            {' '}· Traslado: {remito.encargadoTraslado}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/remitos"
            className="inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-secondary"
          >
            ← Volver
          </Link>
          <button
            onClick={handleDescargar}
            disabled={descargando}
            className="inline-flex h-8 items-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground hover:bg-primary/85 disabled:opacity-50"
          >
            {descargando ? 'Descargando…' : 'Descargar Excel'}
          </button>
        </div>
      </div>

      {remito.estadoStock === 'STOCK_PENDIENTE' && (
        <div className="rounded-lg border border-border bg-secondary p-3 text-xs text-foreground">
          El descuento de stock está pendiente. El sistema reintentará automáticamente.
          Intentos: {remito.intentosDescuento}.
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Ítems del remito ({remito.items.length})
        </h2>
        {remito.items.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin ítems.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-secondary text-xs font-medium uppercase text-muted-foreground">
                  <th className="px-4 py-3 text-left">Material</th>
                  <th className="px-4 py-3 text-right">Pedido</th>
                  <th className="px-4 py-3 text-right">En stock</th>
                  <th className="px-4 py-3 text-right">Faltante</th>
                  <th className="px-4 py-3 text-left">Unidad</th>
                  <th className="px-4 py-3 text-left">Condición</th>
                </tr>
              </thead>
              <tbody>
                {remito.items.map((item) => (
                  <tr key={item.id} className="border-b border-border/50 last:border-0">
                    <td className="px-4 py-3 text-foreground">{item.descripcion}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {item.cantidadPedida}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                      {item.cantidadEnStock}
                    </td>
                    <td
                      className={`px-4 py-3 text-right tabular-nums font-medium ${
                        item.cantidadFaltante > 0 ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {item.cantidadFaltante > 0 ? item.cantidadFaltante : '—'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{item.unidad}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {item.condicionEntrega === 'CON_FALTANTE' ? (
                        <span className="font-medium text-foreground">Con faltante</span>
                      ) : (
                        <span className="text-foreground">Completo</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
