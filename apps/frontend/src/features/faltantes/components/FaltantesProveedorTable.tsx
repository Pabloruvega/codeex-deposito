import { Badge } from '@/components/ui/badge'
import type { FaltanteProveedor } from '../types/faltantes.types'

interface Props {
  faltantes: FaltanteProveedor[]
}

export function FaltantesProveedorTable({ faltantes }: Props) {
  if (faltantes.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay faltantes de proveedor.</p>
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary text-xs font-medium uppercase text-muted-foreground">
            <th className="px-4 py-3 text-left">Proveedor</th>
            <th className="px-4 py-3 text-left">Material</th>
            <th className="px-4 py-3 text-left">Factura</th>
            <th className="px-4 py-3 text-left">Remito</th>
            <th className="px-4 py-3 text-right">Facturado</th>
            <th className="px-4 py-3 text-right">Recibido</th>
            <th className="px-4 py-3 text-right">Diferencia</th>
            <th className="px-4 py-3 text-left">Fecha</th>
            <th className="px-4 py-3 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {faltantes.map((f) => (
            <tr
              key={f.id}
              className={`border-b border-border/50 last:border-0 ${!f.resuelto ? 'bg-secondary' : ''}`}
            >
              <td className="px-4 py-3 font-medium text-foreground">{f.proveedor}</td>
              <td className="px-4 py-3 text-foreground">{f.material?.nombreOficial ?? '—'}</td>
              <td className="px-4 py-3 text-muted-foreground">{f.numeroFactura}</td>
              <td className="px-4 py-3 text-muted-foreground">{f.numeroRemito}</td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                {f.cantidadFacturada}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                {f.cantidadRecibida}
              </td>
              <td className="px-4 py-3 text-right tabular-nums font-semibold text-foreground">
                {f.diferencia}
              </td>
              <td className="px-4 py-3 text-xs text-muted-foreground">
                {new Date(f.fechaRemito).toLocaleDateString('es-AR')}
              </td>
              <td className="px-4 py-3">
                {f.resuelto ? (
                  <Badge variant="success">Resuelto</Badge>
                ) : (
                  <Badge variant="warning">Pendiente</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
