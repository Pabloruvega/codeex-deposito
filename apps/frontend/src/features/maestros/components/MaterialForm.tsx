'use client'

import { useWatch, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useCrearMaterial } from '../hooks/useCrearMaterial'
import { useActualizarMaterial } from '../hooks/useActualizarMaterial'
import {
  CATEGORIAS,
  CATEGORIAS_CON_LONGITUD,
  UNIDADES,
  type Material,
} from '../types/maestros.types'

const schema = z
  .object({
    codigoProveedor: z.string().optional(),
    nombreOficial: z.string().min(1, 'Requerido'),
    categoria: z.enum([
      'CANO_AGUA',
      'CANO_CLOACA',
      'CANO_GAS',
      'CANO_ELECTRICO',
      'ACCESORIO_PLOMERIA',
      'VALVULA',
      'TANQUE',
      'HERRAMIENTA',
      'OTRO',
    ]),
    unidadStock: z.enum(['UNIDAD', 'METRO']),
    unidadPedido: z.enum(['UNIDAD', 'METRO']),
    longitudEstandar: z.number().min(0.01, 'Debe ser mayor a 0').nullable(),
  })
  .refine(
    (data) =>
      !CATEGORIAS_CON_LONGITUD.includes(data.categoria) || data.longitudEstandar !== null,
    { message: 'Requerida para esta categoría', path: ['longitudEstandar'] },
  )

type FormData = z.infer<typeof schema>

interface Props {
  material?: Material
  onSuccess: () => void
}

export function MaterialForm({ material, onSuccess }: Props) {
  const crearMaterial = useCrearMaterial()
  const actualizarMaterial = useActualizarMaterial()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      codigoProveedor: material?.codigoProveedor ?? '',
      nombreOficial: material?.nombreOficial ?? '',
      categoria: material?.categoria ?? 'OTRO',
      unidadStock: material?.unidadStock ?? 'UNIDAD',
      unidadPedido: material?.unidadPedido ?? 'UNIDAD',
      longitudEstandar: material?.longitudEstandar ?? null,
    },
  })

  const categoriaActual = useWatch({ control, name: 'categoria' })
  const necesitaLongitud = CATEGORIAS_CON_LONGITUD.includes(categoriaActual)
  const isPending = crearMaterial.isPending || actualizarMaterial.isPending

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      codigoProveedor: data.codigoProveedor || undefined,
      longitudEstandar: necesitaLongitud ? data.longitudEstandar : null,
    }
    if (material) {
      await actualizarMaterial.mutateAsync({ id: material.id, data: payload })
    } else {
      await crearMaterial.mutateAsync(payload)
    }
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nombreOficial">Nombre oficial</Label>
          <Input id="nombreOficial" {...register('nombreOficial')} />
          {errors.nombreOficial && (
            <p className="mt-1 text-xs text-destructive">{errors.nombreOficial.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="codigoProveedor">Código proveedor</Label>
          <Input id="codigoProveedor" {...register('codigoProveedor')} placeholder="Opcional" />
        </div>
      </div>

      <div>
        <Label htmlFor="categoria">Categoría</Label>
        <Select id="categoria" {...register('categoria')}>
          {CATEGORIAS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </Select>
        {errors.categoria && (
          <p className="mt-1 text-xs text-destructive">{errors.categoria.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="unidadStock">Unidad de stock</Label>
          <Select id="unidadStock" {...register('unidadStock')}>
            {UNIDADES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="unidadPedido">Unidad de pedido</Label>
          <Select id="unidadPedido" {...register('unidadPedido')}>
            {UNIDADES.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {necesitaLongitud && (
        <div>
          <Label htmlFor="longitudEstandar">Longitud estándar (m)</Label>
          <Input
            id="longitudEstandar"
            type="number"
            step="0.01"
            {...register('longitudEstandar', {
              setValueAs: (v: string) =>
                v === '' || v === undefined || v === null ? null : parseFloat(v),
            })}
            placeholder="Ej: 6"
          />
          {errors.longitudEstandar && (
            <p className="mt-1 text-xs text-destructive">{errors.longitudEstandar.message}</p>
          )}
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? 'Guardando...' : material ? 'Guardar cambios' : 'Crear material'}
        </Button>
      </div>
    </form>
  )
}
