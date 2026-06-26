import { RecepcionDetalle } from '@/features/recepciones/components/RecepcionDetalle'

interface Props {
  params: Promise<{ id: string }>
}

export default async function RecepcionDetallePage({ params }: Props) {
  const { id } = await params
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <RecepcionDetalle id={id} />
    </div>
  )
}
