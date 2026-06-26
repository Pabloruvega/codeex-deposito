'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle } from '@/components/ui/dialog'
import { useConfirmarPedido } from '../hooks/useConfirmarPedido'
import type { ResumenResolucion } from '../types/pedido.types'

interface Props {
  pedidoId: string
  resumen: ResumenResolucion
}

export function ConfirmarPedidoButton({ pedidoId, resumen }: Props) {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { mutate, isPending } = useConfirmarPedido()

  const pendientes = resumen.pendientesConfirmacion + resumen.sinMatch
  const disabled = pendientes > 0

  const handleConfirmar = () => {
    mutate(pedidoId, {
      onSuccess: () => {
        setOpen(false)
        router.push('/remitos')
      },
    })
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <Button onClick={() => setOpen(true)} disabled={disabled}>
          Confirmar pedido
        </Button>
        {disabled && (
          <p className="text-xs text-muted-foreground">
            Quedan {pendientes} ítem{pendientes !== 1 ? 's' : ''} sin resolver
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Confirmar pedido?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Esta acción no se puede deshacer. El pedido quedará en estado{' '}
            <strong className="text-foreground">Confirmado</strong> y se habilitará la generación del remito.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmar} disabled={isPending}>
              {isPending ? 'Confirmando…' : 'Confirmar pedido'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
