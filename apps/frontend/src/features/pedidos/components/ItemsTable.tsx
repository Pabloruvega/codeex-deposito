'use client'

import { useQuery } from '@tanstack/react-query'
import { pedidosService } from '../services/pedidos.service'
import { ItemResolucionRow } from './ItemResolucionRow'
import type { ItemPedidoRaw } from '../types/pedido.types'

interface Props {
  items: ItemPedidoRaw[]
  pedidoId: string
  esPedidoEditable: boolean
}

export function ItemsTable({ items, pedidoId, esPedidoEditable }: Props) {
  const { data: materiales = [] } = useQuery({
    queryKey: ['materiales'],
    queryFn: pedidosService.getMateriales,
    staleTime: 5 * 60 * 1000,
  })

  const orden: Record<string, number> = {
    SIN_MATCH: 0,
    PENDIENTE_CONFIRMACION: 1,
    RESUELTO_AUTOMATICO: 2,
  }
  const itemsOrdenados = [...items].sort(
    (a, b) => orden[a.estadoResolucion] - orden[b.estadoResolucion],
  )

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary text-xs font-medium uppercase text-muted-foreground">
            <th className="py-3 pr-3 text-left">#</th>
            <th className="py-3 pr-4 text-left">Texto original</th>
            <th className="py-3 pr-4 text-left">Cantidad</th>
            <th className="py-3 pr-4 text-left">Estado</th>
            <th className="py-3 text-left">Material asignado</th>
          </tr>
        </thead>
        <tbody>
          {itemsOrdenados.map((item) => (
            <ItemResolucionRow
              key={item.id}
              item={item}
              pedidoId={pedidoId}
              materiales={materiales}
              esPedidoEditable={esPedidoEditable}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
