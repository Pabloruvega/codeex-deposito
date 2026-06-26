'use client'

import type { ResumenResolucion as TResumen } from '../types/pedido.types'

interface Props {
  resumen: TResumen
}

export function ResumenResolucion({ resumen }: Props) {
  const { totalItems, resueltosAutomatico, pendientesConfirmacion, sinMatch } = resumen

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      <Card label="Total" value={totalItems} emphasis="none" />
      <Card label="Resueltos" value={resueltosAutomatico} emphasis="strong" />
      <Card label="Pendientes" value={pendientesConfirmacion} emphasis="outlined" />
      <Card label="Sin match" value={sinMatch} emphasis="muted" />
    </div>
  )
}

function Card({
  label,
  value,
  emphasis,
}: {
  label: string
  value: number
  emphasis: 'none' | 'strong' | 'outlined' | 'muted'
}) {
  const styles = {
    none: 'bg-secondary border-border text-foreground',
    strong: 'bg-foreground border-foreground text-background',
    outlined: 'bg-card border-border text-foreground',
    muted: 'bg-muted border-border text-muted-foreground',
  }

  return (
    <div className={`rounded-lg border p-4 ${styles[emphasis]}`}>
      <p className="text-xs font-medium uppercase tracking-wide opacity-70">{label}</p>
      <p className="mt-1 text-3xl font-bold">{value}</p>
    </div>
  )
}
