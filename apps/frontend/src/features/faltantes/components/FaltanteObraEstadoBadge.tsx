import { Badge } from '@/components/ui/badge'
import type { EstadoFaltanteObra } from '../types/faltantes.types'

const VARIANTES: Record<
  EstadoFaltanteObra,
  { variant: 'inactive' | 'warning' | 'success'; label: string }
> = {
  PENDIENTE: { variant: 'inactive', label: 'Pendiente' },
  EN_COMPRA: { variant: 'warning', label: 'En compra' },
  RESUELTO: { variant: 'success', label: 'Resuelto' },
}

interface Props {
  estado: EstadoFaltanteObra
}

export function FaltanteObraEstadoBadge({ estado }: Props) {
  const cfg = VARIANTES[estado] ?? VARIANTES.PENDIENTE
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>
}
