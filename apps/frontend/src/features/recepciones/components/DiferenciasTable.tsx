import { Badge } from '@/components/ui/badge'
import type { ItemRecepcion } from '../types/recepcion.types'

interface Props {
  items: ItemRecepcion[]
}

export function DiferenciasTable({ items }: Props) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">Sin ítems.</p>

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary text-xs font-medium uppercase text-muted-foreground">
            <th className="px-4 py-3 text-left">Código prov.</th>
            <th className="px-4 py-3 text-left">Descripción</th>
            <th className="px-4 py-3 text-right">Facturado</th>
            <th className="px-4 py-3 text-right">Recibido</th>
            <th className="px-4 py-3 text-right">Diferencia</th>
            <th className="px-4 py-3 text-left">Estado</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr
              key={item.id}
              className={`border-b border-border/50 last:border-0 ${item.tieneFaltante ? 'bg-secondary' : ''}`}
            >
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{item.codigoProveedor}</td>
              <td className="px-4 py-3 text-foreground">{item.descripcionProveedor}</td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                {item.cantidadFacturada}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-muted-foreground">
                {item.cantidadRecibida}
              </td>
              <td
                className={`px-4 py-3 text-right tabular-nums font-semibold ${
                  item.tieneFaltante ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {item.tieneFaltante ? item.diferencia : '—'}
              </td>
              <td className="px-4 py-3">
                {item.tieneFaltante ? (
                  <Badge variant="warning">Faltante</Badge>
                ) : (
                  <Badge variant="success">OK</Badge>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
