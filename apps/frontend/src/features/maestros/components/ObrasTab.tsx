'use client'

import { useState } from 'react'
import { Plus, Pencil, Building2 } from 'lucide-react'
import { useObras } from '../hooks/useObras'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ObraForm } from './ObraForm'
import { ObraProveedorForm } from './ObraProveedorForm'
import type { Obra } from '../types/maestros.types'

export function ObrasTab() {
  const { data: obras = [], isLoading } = useObras()
  const [editando, setEditando] = useState<Obra | null>(null)
  const [agregandoProveedorA, setAgregandoProveedorA] = useState<string | null>(null)
  const [creando, setCreando] = useState(false)

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Cargando obras...</div>
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold text-foreground">
          {obras.length} {obras.length === 1 ? 'obra' : 'obras'}
        </h2>
        <Button size="sm" onClick={() => setCreando(true)}>
          <Plus size={14} />
          Nueva obra
        </Button>
      </div>

      {obras.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          No hay obras registradas
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {obras.map((obra) => (
                <tr key={obra.id} className="hover:bg-secondary">
                  <td className="px-4 py-3 font-medium text-foreground">{obra.nombre}</td>
                  <td className="px-4 py-3">
                    <Badge variant={obra.activa ? 'success' : 'inactive'}>
                      {obra.activa ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditando(obra)}>
                        <Pencil size={13} />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAgregandoProveedorA(obra.id)}
                      >
                        <Building2 size={13} />
                        Proveedor
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={creando} onOpenChange={setCreando}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Nueva obra</DialogTitle>
          </DialogHeader>
          <ObraForm onSuccess={() => setCreando(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editando} onOpenChange={() => setEditando(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Editar obra</DialogTitle>
          </DialogHeader>
          {editando && <ObraForm obra={editando} onSuccess={() => setEditando(null)} />}
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!agregandoProveedorA}
        onOpenChange={() => setAgregandoProveedorA(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Agregar proveedor</DialogTitle>
          </DialogHeader>
          {agregandoProveedorA && (
            <ObraProveedorForm
              obraId={agregandoProveedorA}
              onSuccess={() => setAgregandoProveedorA(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
