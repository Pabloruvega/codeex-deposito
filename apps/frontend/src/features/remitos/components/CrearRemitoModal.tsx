'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { usePedidos } from '@/features/pedidos/hooks/usePedidos'
import { usePedido } from '@/features/pedidos/hooks/usePedido'
import { useCrearRemito } from '../hooks/useCrearRemito'

interface FormState {
  encargadoDeposito: string
  encargadoTraslado: string
  fechaRetiroDeposito: string
}

export function CrearRemitoModal() {
  const [open, setOpen] = useState(false)
  const [pedidoId, setPedidoId] = useState('')
  const [form, setForm] = useState<FormState>({
    encargadoDeposito: '',
    encargadoTraslado: '',
    fechaRetiroDeposito: '',
  })

  const { data: pedidosConfirmados = [], isLoading: loadingPedidos } = usePedidos(
    { estado: 'CONFIRMADO' },
  )
  const { data: pedidoDetalle, isLoading: loadingDetalle } = usePedido(pedidoId)
  const { mutate: crear, isPending, error } = useCrearRemito()

  const itemsValidos =
    pedidoDetalle?.items?.filter((i) => i.materialId !== null) ?? []

  const puedeEnviar =
    pedidoId &&
    form.encargadoDeposito.trim() &&
    form.encargadoTraslado.trim() &&
    form.fechaRetiroDeposito &&
    itemsValidos.length > 0

  const handleCrear = () => {
    if (!puedeEnviar) return
    crear(
      {
        pedidoId,
        encargadoDeposito: form.encargadoDeposito.trim(),
        encargadoTraslado: form.encargadoTraslado.trim(),
        fechaRetiroDeposito: form.fechaRetiroDeposito,
        items: itemsValidos.map((i) => ({
          materialId: i.materialId!,
          cantidadPedida: i.cantidadNormalizada,
        })),
      },
      {
        onSuccess: () => {
          setOpen(false)
          setPedidoId('')
          setForm({ encargadoDeposito: '', encargadoTraslado: '', fechaRetiroDeposito: '' })
        },
      },
    )
  }

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v) {
      setPedidoId('')
      setForm({ encargadoDeposito: '', encargadoTraslado: '', fechaRetiroDeposito: '' })
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">Nuevo remito</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">
            Generar remito de salida
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Pedido selector */}
          <div>
            <Label htmlFor="pedido-select">Pedido confirmado</Label>
            {loadingPedidos ? (
              <p className="mt-1 text-sm text-muted-foreground">Cargando pedidos…</p>
            ) : pedidosConfirmados.length === 0 ? (
              <p className="mt-1 text-sm text-muted-foreground">No hay pedidos confirmados disponibles.</p>
            ) : (
              <select
                id="pedido-select"
                value={pedidoId}
                onChange={(e) => setPedidoId(e.target.value)}
                className="mt-1 flex h-10 w-full rounded-md border border-input bg-card px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1"
              >
                <option value="">Seleccioná un pedido…</option>
                {pedidosConfirmados.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.obra?.nombre ?? p.obraId} — {p.solicitante} (
                    {new Date(p.fechaPedido).toLocaleDateString('es-AR')})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Ítems del pedido seleccionado */}
          {pedidoId && (
            <div className="rounded-lg border border-border bg-secondary p-3 text-xs text-muted-foreground">
              {loadingDetalle ? (
                <span className="text-muted-foreground">Cargando ítems…</span>
              ) : itemsValidos.length === 0 ? (
                <span className="text-muted-foreground">Este pedido no tiene ítems con material asignado.</span>
              ) : (
                <>
                  <p className="mb-2 font-medium text-foreground">{itemsValidos.length} ítems a incluir:</p>
                  <ul className="space-y-0.5">
                    {itemsValidos.map((i) => (
                      <li key={i.id} className="truncate">
                        · {i.material?.nombreOficial ?? i.materialId} — {i.cantidadNormalizada}{' '}
                        {i.unidadPedido}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          )}

          {/* Campos de cabecera */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="encargado-deposito">Encargado depósito</Label>
              <Input
                id="encargado-deposito"
                className="mt-1"
                value={form.encargadoDeposito}
                onChange={(e) => setForm((f) => ({ ...f, encargadoDeposito: e.target.value }))}
                placeholder="Nombre completo"
              />
            </div>
            <div>
              <Label htmlFor="encargado-traslado">Encargado traslado</Label>
              <Input
                id="encargado-traslado"
                className="mt-1"
                value={form.encargadoTraslado}
                onChange={(e) => setForm((f) => ({ ...f, encargadoTraslado: e.target.value }))}
                placeholder="Nombre completo"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="fecha-retiro">Fecha retiro depósito</Label>
            <Input
              id="fecha-retiro"
              type="date"
              className="mt-1 w-48"
              value={form.fechaRetiroDeposito}
              onChange={(e) => setForm((f) => ({ ...f, fechaRetiroDeposito: e.target.value }))}
            />
          </div>

          {error && (
            <p className="text-xs text-destructive">
              {error instanceof Error ? error.message : 'Error al generar el remito'}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button size="sm" onClick={handleCrear} disabled={!puedeEnviar || isPending}>
            {isPending ? 'Generando…' : 'Generar remito'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
