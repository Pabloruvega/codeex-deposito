'use client'

import { useStock } from '../hooks/useStock'

const CATEGORIA_LABEL: Record<string, string> = {
  CANO_AGUA: 'Caño agua',
  CANO_CLOACA: 'Caño cloaca',
  CANO_GAS: 'Caño gas',
  CANO_ELECTRICO: 'Caño eléctrico',
  ACCESORIO_PLOMERIA: 'Accesorio plomería',
  VALVULA: 'Válvula',
  TANQUE: 'Tanque',
  HERRAMIENTA: 'Herramienta',
  OTRO: 'Otro',
}

interface Props {
  obraId: string
  proveedor: string
}

export function StockTable({ obraId, proveedor }: Props) {
  const { data: items = [], isLoading, isError } = useStock(obraId, proveedor)

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Cargando stock…</div>
  }

  if (isError) {
    return (
      <div className="py-12 text-center text-sm text-destructive">
        Error al cargar el stock.
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-border py-12 text-center text-sm text-muted-foreground">
        Sin movimientos de stock registrados para esta obra y proveedor.
      </div>
    )
  }

  const conStock = items.filter((i) => i.cantidad > 0)
  const sinStock = items.filter((i) => i.cantidad <= 0)
  const sorted = [...conStock, ...sinStock]

  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-secondary text-xs font-medium uppercase text-muted-foreground">
            <th className="px-4 py-3 text-left">Material</th>
            <th className="px-4 py-3 text-left">Categoría</th>
            <th className="px-4 py-3 text-right">Cantidad</th>
            <th className="px-4 py-3 text-left">Unidad</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((item) => (
            <tr
              key={item.id}
              className="border-b border-border/50 last:border-0 transition-colors hover:bg-secondary"
            >
              <td className="px-4 py-3 font-medium text-foreground">
                {item.material.nombreOficial}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {CATEGORIA_LABEL[item.material.categoria] ?? item.material.categoria}
              </td>
              <td
                className={`px-4 py-3 text-right tabular-nums font-semibold ${
                  item.cantidad === 0
                    ? 'text-muted-foreground'
                    : 'text-foreground'
                }`}
              >
                {item.cantidad < 0 ? `${item.cantidad}` : item.cantidad}
              </td>
              <td className="px-4 py-3 text-muted-foreground">
                {item.material.unidadStock === 'METRO' ? 'm' : 'u'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="border-t border-border/50 bg-secondary px-4 py-2 text-xs text-muted-foreground">
        {items.length} materiales · {conStock.length} con stock disponible
      </div>
    </div>
  )
}
