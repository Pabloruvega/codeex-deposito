'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { usePedido } from '../hooks/usePedido'
import { computarResumen } from '../types/pedido.types'
import { ResumenResolucion } from './ResumenResolucion'
import { ItemsTable } from './ItemsTable'
import { ConfirmarPedidoButton } from './ConfirmarPedidoButton'
import type { EstadoPedido } from '../types/pedido.types'

const ESTADO_BADGE: Record<EstadoPedido, { variant: 'warning' | 'success' | 'info'; label: string }> = {
  PENDIENTE_REVISION: { variant: 'warning', label: 'Pendiente revisión' },
  CONFIRMADO: { variant: 'success', label: 'Confirmado' },
  REMITO_GENERADO: { variant: 'info', label: 'Remito generado' },
}

interface Props {
  id: string
}

export function PedidoDetalle({ id }: Props) {
  const { data: pedido, isLoading, isError } = usePedido(id)

  if (isLoading) {
    return <div className="py-20 text-center text-sm text-muted-foreground">Cargando pedido…</div>
  }

  if (isError || !pedido) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-destructive">No se encontró el pedido.</p>
        <Link
          href="/pedidos"
          className="mt-4 inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-secondary"
        >
          Volver a pedidos
        </Link>
      </div>
    )
  }

  const resumen = computarResumen(pedido.items)
  const esPedidoEditable = pedido.estado === 'PENDIENTE_REVISION'
  const badgeInfo = ESTADO_BADGE[pedido.estado]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">
              Pedido — {pedido.obra?.nombre ?? pedido.obraId}
            </h1>
            <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Solicitante: <strong>{pedido.solicitante}</strong> ·{' '}
            {new Date(pedido.fechaPedido).toLocaleDateString('es-AR')} ·{' '}
            Archivo: {pedido.tipoArchivo}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/pedidos"
            className="inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-secondary"
          >
            ← Volver
          </Link>
          {esPedidoEditable && (
            <ConfirmarPedidoButton pedidoId={id} resumen={resumen} />
          )}
        </div>
      </div>

      <ResumenResolucion resumen={resumen} />

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Ítems del pedido ({resumen.totalItems})
        </h2>
        <ItemsTable
          items={pedido.items ?? []}
          pedidoId={id}
          esPedidoEditable={esPedidoEditable}
        />
      </div>

      {pedido.advertencias && pedido.advertencias.length > 0 && (
        <div className="rounded-lg border border-border bg-secondary p-3 text-xs text-foreground">
          {pedido.advertencias.join(' · ')}
        </div>
      )}
    </div>
  )
}
