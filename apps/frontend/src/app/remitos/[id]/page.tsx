import { RemitoDetalle } from '@/features/remitos/components/RemitoDetalle'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RemitoDetallePage({ params }: Props) {
  const { id } = await params
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <RemitoDetalle id={id} />
    </div>
  )
}
