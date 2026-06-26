'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { useRecepcion } from '../hooks/useRecepcion'
import { DiferenciasTable } from './DiferenciasTable'

interface Props {
  id: string
}

export function RecepcionDetalle({ id }: Props) {
  const { data: recepcion, isLoading, isError } = useRecepcion(id)

  if (isLoading) {
    return (
      <div className="py-20 text-center text-sm text-muted-foreground">Cargando recepción…</div>
    )
  }

  if (isError || !recepcion) {
    return (
      <div className="py-20 text-center">
        <p className="text-sm text-destructive">No se encontró la recepción.</p>
        <Link
          href="/recepciones"
          className="mt-4 inline-flex h-8 items-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-secondary"
        >
          Volver a recepciones
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-foreground">
              Factura {recepcion.numeroFactura}
            </h1>
            {recepcion.estado === 'COMPLETA' ? (
              <Badge variant="success">Completa</Badge>
            ) : (
              <Badge variant="warning">Con diferencias</Badge>
            )}
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Proveedor: <strong>{recepcion.proveedor}</strong>
            {' · '}Remito: {recepcion.numeroRemito}
            {' · '}Obra: {recepcion.obra?.nombre ?? recepcion.obraId}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Fecha remito: {new Date(recepcion.fechaRemito).toLocaleDateString('es-AR')}
            {' · '}Recepción:{' '}
            {new Date(recepcion.fechaRecepcion).toLocaleDateString('es-AR')}
          </p>
        </div>
        <Link
          href="/recepciones"
          className="inline-flex h-8 self-start items-center rounded-md border border-border bg-card px-3 text-xs font-medium text-foreground hover:bg-secondary"
        >
          ← Volver
        </Link>
      </div>

      {recepcion.estado === 'CON_DIFERENCIAS' && (
        <div className="rounded-lg border border-border bg-secondary p-3 text-xs text-foreground">
          Esta recepción tiene diferencias entre las cantidades facturadas y recibidas.
          Los faltantes quedaron registrados para reclamo al proveedor.
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-semibold text-foreground">
          Ítems ({recepcion.items?.length ?? 0})
        </h2>
        <DiferenciasTable items={recepcion.items ?? []} />
      </div>
    </div>
  )
}
