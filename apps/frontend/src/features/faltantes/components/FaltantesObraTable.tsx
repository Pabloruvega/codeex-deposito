'use client'

import { useActualizarFaltanteObra } from '../hooks/useActualizarFaltanteObra'
import { FaltanteObraEstadoBadge } from './FaltanteObraEstadoBadge'
import type { FaltanteObra, EstadoFaltanteObra } from '../types/faltantes.types'

const TRANSICIONES: Record<EstadoFaltanteObra, EstadoFaltanteObra[]> = {
  PENDIENTE: ['EN_COMPRA'],
  EN_COMPRA: ['RESUELTO'],
  RESUELTO: [],
}

const LABEL_ESTADO: Record<EstadoFaltanteObra, string> = {
  PENDIENTE: 'Pendiente',
  EN_COMPRA: 'En compra',
  RESUELTO: 'Resuelto',
}

interface Props {
  faltantes: FaltanteObra[]
}

export function FaltantesObraTable({ faltantes }: Props) {
  const { mutate: actualizar, isPending } = useActualizarFaltanteObra()

  if (faltantes.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay faltantes de obra.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary text-xs font-medium uppercase text-muted-foreground">
            <th className="px-4 py-3 text-left">Obra</th>
            <th className="px-4 py-3 text-left">Material</th>
            <th className="px-4 py-3 text-right">Pedido</th>
            <th className="px-4 py-3 text-right">Faltante</th>
            <th className="px-4 py-3 text-left">Unidad</th>
            <th className="px-4 py-3 text-left">Estado</th>
            <th className="px-4 py-3 text-left">Creado</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {faltantes.map((f) => {
            const siguientes = TRANSICIONES[f.estado]
            return (
              <tr key={f.id} className="border-b border-border/50 last:border-0">
                <td className="px-4 py-3 text-muted-foreground">{f.obra?.nombre ?? f.obraId}</td>
                <td className="px-4 py-3 text-foreground">
                  {f.material?.nombreOficial ?? f.descripcion}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                  {f.cantidadPedida}
                </td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">
                  {f.cantidadFaltante}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{f.unidad}</td>
                <td className="px-4 py-3">
                  <FaltanteObraEstadoBadge estado={f.estado} />
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {new Date(f.creadoEn).toLocaleDateString('es-AR')}
                </td>
                <td className="px-4 py-3 text-right">
                  {siguientes.length > 0 && (
                    <select
                      defaultValue=""
                      disabled={isPending}
                      onChange={(e) => {
                        if (e.target.value) actualizar({ id: f.id, estado: e.target.value })
                      }}
                      className="h-7 rounded border border-border bg-card px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:opacity-50"
                    >
                      <option value="">Cambiar…</option>
                      {siguientes.map((s) => (
                        <option key={s} value={s}>
                          {LABEL_ESTADO[s]}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
