import { PedidoDetalle } from '@/features/pedidos/components/PedidoDetalle'

interface Props {
  params: Promise<{ id: string }>
}

export default async function PedidoDetallePage({ params }: Props) {
  const { id } = await params
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <PedidoDetalle id={id} />
    </div>
  )
}
