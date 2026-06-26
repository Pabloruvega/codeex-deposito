'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAgregarProveedor } from '../hooks/useAgregarProveedor'

const schema = z.object({
  proveedor: z.string().min(1, 'Requerido'),
  spreadsheetIdStock: z.string().min(1, 'Requerido'),
  spreadsheetIdControl: z.string().min(1, 'Requerido'),
})

type FormData = z.infer<typeof schema>

interface Props {
  obraId: string
  onSuccess: () => void
}

export function ObraProveedorForm({ obraId, onSuccess }: Props) {
  const agregarProveedor = useAgregarProveedor()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    await agregarProveedor.mutateAsync({ obraId, data })
    onSuccess()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="proveedor">Nombre del proveedor</Label>
        <Input id="proveedor" {...register('proveedor')} placeholder="Ej: Ferretería Sur" />
        {errors.proveedor && (
          <p className="mt-1 text-xs text-destructive">{errors.proveedor.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="spreadsheetIdStock">Spreadsheet ID — Stock</Label>
        <Input
          id="spreadsheetIdStock"
          {...register('spreadsheetIdStock')}
          placeholder="ID del Google Sheet de stock"
          className="font-mono text-xs"
        />
        {errors.spreadsheetIdStock && (
          <p className="mt-1 text-xs text-destructive">{errors.spreadsheetIdStock.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="spreadsheetIdControl">Spreadsheet ID — Control</Label>
        <Input
          id="spreadsheetIdControl"
          {...register('spreadsheetIdControl')}
          placeholder="ID del Google Sheet de control"
          className="font-mono text-xs"
        />
        {errors.spreadsheetIdControl && (
          <p className="mt-1 text-xs text-destructive">{errors.spreadsheetIdControl.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={agregarProveedor.isPending}>
          {agregarProveedor.isPending ? 'Agregando...' : 'Agregar proveedor'}
        </Button>
      </div>
    </form>
  )
}
