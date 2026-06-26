'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { useObras } from '@/features/maestros/hooks/useObras'
import { useCrearRemitoEntrada } from '../hooks/useCrearRemitoEntrada'
import type { CrearRemitoEntradaDto } from '../types/recepcion.types'

interface ItemRow {
  codigoProveedor: string
  descripcionProveedor: string
  cantidad: string
  unidad: string
}

const ITEM_VACIO: ItemRow = {
  codigoProveedor: '',
  descripcionProveedor: '',
  cantidad: '',
  unidad: '',
}

interface Props {
  open: boolean
  onClose: () => void
}

export function RemitoEntradaForm({ open, onClose }: Props) {
  const [obraId, setObraId] = useState('')
  const [proveedor, setProveedor] = useState('')
  const [numeroRemito, setNumeroRemito] = useState('')
  const [fechaRemito, setFechaRemito] = useState('')
  const [items, setItems] = useState<ItemRow[]>([{ ...ITEM_VACIO }])

  const { data: obras = [] } = useObras()
  const { mutate: crear, isPending, error } = useCrearRemitoEntrada()

  const setItem = (i: number, campo: keyof ItemRow, valor: string) => {
    setItems((prev) =>
      prev.map((row, idx) => (idx === i ? { ...row, [campo]: valor } : row)),
    )
  }
  const addItem = () => setItems((prev) => [...prev, { ...ITEM_VACIO }])
  const removeItem = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i))

  const reset = () => {
    setObraId('')
    setProveedor('')
    setNumeroRemito('')
    setFechaRemito('')
    setItems([{ ...ITEM_VACIO }])
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  const puedeEnviar =
    obraId &&
    proveedor.trim() &&
    numeroRemito.trim() &&
    fechaRemito &&
    items.length > 0 &&
    items.every(
      (i) =>
        i.codigoProveedor.trim() &&
        i.descripcionProveedor.trim() &&
        Number(i.cantidad) > 0,
    )

  const handleGuardar = () => {
    if (!puedeEnviar) return
    const dto: CrearRemitoEntradaDto = {
      obraId,
      proveedor: proveedor.trim(),
      numeroRemito: numeroRemito.trim(),
      fechaRemito,
      items: items.map((i) => ({
        codigoProveedor: i.codigoProveedor.trim(),
        descripcionProveedor: i.descripcionProveedor.trim(),
        cantidad: Number(i.cantidad),
        ...(i.unidad.trim() ? { unidad: i.unidad.trim() } : {}),
      })),
    }
    crear(dto, { onSuccess: handleClose })
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose() }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Cargar remito de entrada
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="re-obra">Obra</Label>
              <Select
                id="re-obra"
                value={obraId}
                onChange={(e) => setObraId(e.target.value)}
                className="mt-1"
              >
                <option value="">Seleccioná una obra…</option>
                {obras.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.nombre}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="re-proveedor">Proveedor</Label>
              <Input
                id="re-proveedor"
                className="mt-1"
                value={proveedor}
                onChange={(e) => setProveedor(e.target.value)}
                placeholder="Nombre del proveedor"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="re-numero">N° de remito</Label>
              <Input
                id="re-numero"
                className="mt-1"
                value={numeroRemito}
                onChange={(e) => setNumeroRemito(e.target.value)}
                placeholder="Ej: 0001-00012345"
              />
            </div>
            <div>
              <Label htmlFor="re-fecha">Fecha del remito</Label>
              <Input
                id="re-fecha"
                type="date"
                className="mt-1"
                value={fechaRemito}
                onChange={(e) => setFechaRemito(e.target.value)}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <Label>Ítems</Label>
              <button
                onClick={addItem}
                className="text-xs font-medium text-foreground hover:underline"
              >
                + Agregar fila
              </button>
            </div>
            <div className="overflow-hidden rounded-lg border border-border">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-secondary text-muted-foreground">
                    <th className="px-3 py-2 text-left">Código prov.</th>
                    <th className="px-3 py-2 text-left">Descripción</th>
                    <th className="w-20 px-3 py-2 text-right">Cantidad</th>
                    <th className="w-20 px-3 py-2 text-left">Unidad</th>
                    <th className="w-8 px-3 py-2" />
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0">
                      <td className="px-2 py-1">
                        <input
                          value={item.codigoProveedor}
                          onChange={(e) => setItem(i, 'codigoProveedor', e.target.value)}
                          className="h-7 w-full rounded border border-border px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={item.descripcionProveedor}
                          onChange={(e) => setItem(i, 'descripcionProveedor', e.target.value)}
                          className="h-7 w-full rounded border border-border px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          type="number"
                          min="0"
                          value={item.cantidad}
                          onChange={(e) => setItem(i, 'cantidad', e.target.value)}
                          className="h-7 w-full rounded border border-border px-2 text-right text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="px-2 py-1">
                        <input
                          value={item.unidad}
                          onChange={(e) => setItem(i, 'unidad', e.target.value)}
                          placeholder="u, m…"
                          className="h-7 w-full rounded border border-border px-2 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </td>
                      <td className="px-2 py-1 text-center">
                        <button
                          onClick={() => removeItem(i)}
                          disabled={items.length === 1}
                          className="text-muted-foreground hover:text-destructive disabled:opacity-20"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {error && (
            <p className="text-xs text-destructive">
              {error instanceof Error ? error.message : 'Error al guardar el remito'}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleGuardar} disabled={!puedeEnviar || isPending}>
            {isPending ? 'Guardando…' : 'Guardar remito'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
