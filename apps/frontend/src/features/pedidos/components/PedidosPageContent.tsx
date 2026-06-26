'use client'

import { PedidoUploader } from './PedidoUploader'
import { PedidosList } from './PedidosList'

export function PedidosPageContent() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Pedidos de materiales</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Subí un PDF o imagen con el pedido de obra para procesarlo automáticamente
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <PedidoUploader />
        </div>
        <div className="lg:col-span-2">
          <PedidosList />
        </div>
      </div>
    </div>
  )
}
