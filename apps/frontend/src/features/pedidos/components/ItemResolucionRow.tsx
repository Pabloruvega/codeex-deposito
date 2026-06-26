'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useResolverItem } from '../hooks/useResolverItem'
import type { ItemPedidoRaw } from '../types/pedido.types'
import type { Material } from '@/features/maestros/types/maestros.types'

interface Props {
  item: ItemPedidoRaw
  pedidoId: string
  materiales: Material[]
  esPedidoEditable: boolean
}

const BADGE: Record<string, { variant: 'success' | 'warning' | 'inactive'; label: string }> = {
  RESUELTO_AUTOMATICO: { variant: 'success', label: 'Auto' },
  PENDIENTE_CONFIRMACION: { variant: 'warning', label: 'Pendiente' },
  SIN_MATCH: { variant: 'inactive', label: 'Sin match' },
}

export function ItemResolucionRow({ item, pedidoId, materiales, esPedidoEditable }: Props) {
  const iniciarEdicion =
    item.estadoResolucion !== 'RESUELTO_AUTOMATICO'
  const [enEdicion, setEnEdicion] = useState(iniciarEdicion)
  const [busqueda, setBusqueda] = useState('')
  const [seleccionado, setSeleccionado] = useState<Material | null>(null)
  const [error, setError] = useState('')

  const { mutate, isPending } = useResolverItem(pedidoId)

  const resultados = useMemo(() => {
    if (!busqueda.trim()) return []
    const q = busqueda.toLowerCase()
    return materiales.filter((m) => m.nombreOficial.toLowerCase().includes(q)).slice(0, 6)
  }, [busqueda, materiales])

  const handleAsignar = () => {
    if (!seleccionado) {
      setError('Seleccioná un material')
      return
    }
    setError('')
    mutate(
      { itemId: item.id, dto: { materialId: seleccionado.id, confirmadoPor: 'DEPOSITO' } },
      {
        onSuccess: () => {
          setEnEdicion(false)
          setBusqueda('')
          setSeleccionado(null)
        },
        onError: () => setError('Error al resolver el ítem'),
      },
    )
  }

  const badge = BADGE[item.estadoResolucion]

  return (
    <tr className="border-b border-border/50 text-sm">
      <td className="py-2 pr-3 text-muted-foreground tabular-nums">{item.numeroItem}</td>
      <td className="py-2 pr-4 text-muted-foreground max-w-xs truncate" title={item.textoOriginal}>
        {item.textoOriginal}
      </td>
      <td className="py-2 pr-4 tabular-nums text-foreground">
        {item.cantidadNormalizada} {item.unidadPedido}
      </td>

      <td className="py-2 pr-4">
        <Badge
          variant={badge.variant}
          className={item.estadoResolucion === 'SIN_MATCH' ? 'bg-destructive/10 text-destructive' : undefined}
        >
          {badge.label}
        </Badge>
      </td>

      <td className="py-2 min-w-[240px]">
        {!enEdicion ? (
          <div className="flex items-center gap-2">
            <span className="text-foreground font-medium">{item.material?.nombreOficial}</span>
            {esPedidoEditable && (
              <Button variant="ghost" size="sm" onClick={() => setEnEdicion(true)}>
                Cambiar
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-1">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Buscar material…"
                  value={busqueda}
                  onChange={(e) => {
                    setBusqueda(e.target.value)
                    setSeleccionado(null)
                  }}
                  className="h-8 text-xs"
                />
                {resultados.length > 0 && !seleccionado && (
                  <ul className="absolute z-10 mt-1 w-full rounded border border-border bg-card py-1 shadow-sm">
                    {resultados.map((m) => (
                      <li
                        key={m.id}
                        onClick={() => {
                          setSeleccionado(m)
                          setBusqueda(m.nombreOficial)
                        }}
                        className="cursor-pointer px-3 py-1.5 text-xs hover:bg-secondary"
                      >
                        {m.nombreOficial}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <Button size="sm" onClick={handleAsignar} disabled={isPending || !seleccionado}>
                {isPending ? '…' : 'Asignar'}
              </Button>
              {item.estadoResolucion === 'RESUELTO_AUTOMATICO' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setEnEdicion(false)
                    setBusqueda('')
                    setSeleccionado(null)
                    setError('')
                  }}
                >
                  Cancelar
                </Button>
              )}
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>
        )}
      </td>
    </tr>
  )
}
