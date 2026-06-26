'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useSugerenciasFaltantes } from '../hooks/useSugerenciasFaltantes'
import { useResolverFaltantes } from '../hooks/useResolverFaltantes'

interface Props {
  open: boolean
  recepcionId: string
  onClose: () => void
}

export function SugerenciasFaltantesDialog({ open, recepcionId, onClose }: Props) {
  const { data: sugerencias = [], isLoading } = useSugerenciasFaltantes(recepcionId)
  const { mutate: resolver, isPending } = useResolverFaltantes()
  const [seleccionados, setSeleccionados] = useState<Set<string>>(new Set())

  const toggleSeleccion = (id: string) => {
    setSeleccionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleResolver = () => {
    if (seleccionados.size === 0) return
    resolver(
      { id: recepcionId, faltanteIds: Array.from(seleccionados) },
      { onSuccess: onClose },
    )
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose() }}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Faltantes que esta recepción puede cerrar
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando sugerencias…</p>
        ) : sugerencias.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No hay faltantes pendientes para este proveedor y obra.
          </p>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Seleccioná los faltantes que querés marcar como resueltos con esta recepción.
            </p>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary text-muted-foreground">
                    <th className="w-8 px-3 py-2" />
                    <th className="px-3 py-2 text-left">Material</th>
                    <th className="px-3 py-2 text-left">Factura</th>
                    <th className="px-3 py-2 text-right">Diferencia</th>
                  </tr>
                </thead>
                <tbody>
                  {sugerencias.map((f) => (
                    <tr key={f.id} className="border-b border-border/50 last:border-0">
                      <td className="px-3 py-2 text-center">
                        <input
                          type="checkbox"
                          checked={seleccionados.has(f.id)}
                          onChange={() => toggleSeleccion(f.id)}
                          className="h-4 w-4 rounded border-border"
                        />
                      </td>
                      <td className="px-3 py-2 text-foreground">
                        {f.material?.nombreOficial ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{f.numeroFactura}</td>
                      <td className="px-3 py-2 text-right tabular-nums font-semibold text-foreground">
                        {f.diferencia}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={onClose}>
            {sugerencias.length === 0 ? 'Cerrar' : 'Ignorar todo'}
          </Button>
          {sugerencias.length > 0 && (
            <Button
              size="sm"
              onClick={handleResolver}
              disabled={seleccionados.size === 0 || isPending}
            >
              {isPending
                ? 'Confirmando…'
                : `Confirmar${seleccionados.size > 0 ? ` (${seleccionados.size})` : ''}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
