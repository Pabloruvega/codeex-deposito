'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { usePedidos } from '../hooks/usePedidos'
import type { EstadoPedido } from '../types/pedido.types'

const ESTADO_BADGE: Record<EstadoPedido, { variant: 'warning' | 'success' | 'info'; label: string }> = {
  PENDIENTE_REVISION: { variant: 'warning', label: 'Revisión' },
  CONFIRMADO: { variant: 'success', label: 'Confirmado' },
  REMITO_GENERADO: { variant: 'info', label: 'Remito generado' },
}

export function PedidosList() {
  const { data: pedidos = [], isLoading, isError } = usePedidos()

  if (isLoading) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">Cargando pedidos…</div>
    )
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-sm text-destructive">
        Error al cargar pedidos. Verificá que el servidor esté activo.
      </div>
    )
  }

  if (pedidos.length === 0) {
    return (
      <div className="rounded-xl border border-border py-12 text-center text-sm text-muted-foreground">
        No hay pedidos todavía. Subí el primero arriba.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary text-xs font-medium uppercase text-muted-foreground">
            <th className="px-4 py-3 text-left">Obra</th>
            <th className="px-4 py-3 text-left">Solicitante</th>
            <th className="px-4 py-3 text-left">Fecha pedido</th>
            <th className="px-4 py-3 text-left">Ítems</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {pedidos.map((pedido) => {
            const totalItems = pedido._count?.items ?? pedido.items?.length ?? 0
            const badgeInfo = ESTADO_BADGE[pedido.estado]
            return (
              <tr
                key={pedido.id}
                className="border-b border-border/50 transition-colors hover:bg-secondary"
              >
                <td className="px-4 py-3 font-medium text-foreground">
                  {pedido.obra?.nombre ?? pedido.obraId}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{pedido.solicitante}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(pedido.fechaPedido).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3 tabular-nums text-foreground">{totalItems}</td>
                <td className="px-4 py-3">
                  <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/pedidos/${pedido.id}`}
                    className="inline-flex h-8 items-center rounded-md px-3 text-xs font-medium text-foreground hover:bg-accent"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
