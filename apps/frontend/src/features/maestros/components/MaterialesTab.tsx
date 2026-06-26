'use client'

import { useState } from 'react'
import { Plus, Pencil, Tags } from 'lucide-react'
import { useMateriales } from '../hooks/useMateriales'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { MaterialForm } from './MaterialForm'
import { AliasTable } from './AliasTable'
import { CATEGORIAS } from '../types/maestros.types'
import type { Material } from '../types/maestros.types'

const categoriaLabel = (cat: string) =>
  CATEGORIAS.find((c) => c.value === cat)?.label ?? cat

export function MaterialesTab() {
  const { data: materiales = [], isLoading } = useMateriales()
  const [editando, setEditando] = useState<Material | null>(null)
  const [gestionandoAlias, setGestionandoAlias] = useState<Material | null>(null)
  const [creando, setCreando] = useState(false)
  const [filtro, setFiltro] = useState('')

  const filtrados = filtro
    ? materiales.filter(
        (m) =>
          m.nombreOficial.toLowerCase().includes(filtro.toLowerCase()) ||
          m.codigoProveedor?.toLowerCase().includes(filtro.toLowerCase()),
      )
    : materiales

  if (isLoading) {
    return <div className="py-12 text-center text-sm text-muted-foreground">Cargando materiales...</div>
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <input
          type="search"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          placeholder="Buscar por nombre o código..."
          className="h-9 flex-1 rounded-md border border-input bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <Button size="sm" onClick={() => setCreando(true)}>
          <Plus size={14} />
          Nuevo material
        </Button>
      </div>

      {filtrados.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center text-sm text-muted-foreground">
          {filtro ? 'Sin resultados' : 'No hay materiales registrados'}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-secondary">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nombre</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Categoría</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Stock</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filtrados.map((m) => (
                <tr key={m.id} className="hover:bg-secondary">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">{m.nombreOficial}</span>
                    {m.codigoProveedor && (
                      <span className="ml-2 font-mono text-xs text-muted-foreground">
                        {m.codigoProveedor}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{categoriaLabel(m.categoria)}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{m.unidadStock}</td>
                  <td className="px-4 py-3">
                    <Badge variant={m.activo ? 'success' : 'inactive'}>
                      {m.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button size="sm" variant="ghost" onClick={() => setEditando(m)}>
                        <Pencil size={13} />
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setGestionandoAlias(m)}
                      >
                        <Tags size={13} />
                        Alias
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
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Nuevo material</DialogTitle>
          </DialogHeader>
          <MaterialForm onSuccess={() => setCreando(false)} />
        </DialogContent>
      </Dialog>

      <Dialog open={!!editando} onOpenChange={() => setEditando(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Editar material</DialogTitle>
          </DialogHeader>
          {editando && <MaterialForm material={editando} onSuccess={() => setEditando(null)} />}
        </DialogContent>
      </Dialog>

      <Dialog open={!!gestionandoAlias} onOpenChange={() => setGestionandoAlias(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Alias del material</DialogTitle>
          </DialogHeader>
          {gestionandoAlias && (
            <AliasTable
              materialId={gestionandoAlias.id}
              materialNombre={gestionandoAlias.nombreOficial}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
