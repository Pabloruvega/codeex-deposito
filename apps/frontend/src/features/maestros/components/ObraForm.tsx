'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useCrearObra } from '../hooks/useCrearObra'
import { useActualizarObra } from '../hooks/useActualizarObra'
import type { Obra } from '../types/maestros.types'

const schema = z.object({
  nombre: z.string().min(1, 'El nombre es requerido'),
})

type FormData = z.infer<typeof schema>

interface Props {
  obra?: Obra
  onSuccess: () => void
}

export function ObraForm({ obra, onSuccess }: Props) {
  const crearObra = useCrearObra()
  const actualizarObra = useActualizarObra()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { nombre: obra?.nombre ?? '' },
  })

  const isPending = crearObra.isPending || actualizarObra.isPending

  const onSubmit = async (data: FormData) => {
    if (obra) {
      await actualizarObra.mutateAsync({ id: obra.id, data })
    } else {
      await crearObra.mutateAsync(data)
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="nombre">Nombre de la obra</Label>
        <Input id="nombre" {...register('nombre')} placeholder="Ej: Edificio Centro" />
        {errors.nombre && (
          <p className="mt-1 text-xs text-destructive">{errors.nombre.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : obra ? 'Guardar cambios' : 'Crear obra'}
        </Button>
      </div>
    </form>
  )
}
