'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { useAlias } from '../hooks/useAlias'
import { useCrearAlias } from '../hooks/useCrearAlias'
import { useEliminarAlias } from '../hooks/useEliminarAlias'

interface Props {
  materialId: string
  materialNombre: string
}

export function AliasTable({ materialId, materialNombre }: Props) {
  const { data: alias = [], isLoading } = useAlias(materialId)
  const crearAlias = useCrearAlias(materialId)
  const eliminarAlias = useEliminarAlias(materialId)
  const [nuevoTexto, setNuevoTexto] = useState('')

  const handleAgregar = async () => {
    const texto = nuevoTexto.trim()
    if (!texto) return
    await crearAlias.mutateAsync(texto)
    setNuevoTexto('')
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Material: <span className="font-medium text-foreground">{materialNombre}</span>
      </p>

      <div className="flex gap-2">
        <Input
          value={nuevoTexto}
          onChange={(e) => setNuevoTexto(e.target.value)}
          placeholder="Nuevo alias..."
          onKeyDown={(e) => e.key === 'Enter' && handleAgregar()}
        />
        <Button onClick={handleAgregar} disabled={crearAlias.isPending || !nuevoTexto.trim()}>
          {crearAlias.isPending ? '...' : 'Agregar'}
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : alias.length === 0 ? (
        <p className="text-sm text-muted-foreground py-4 text-center">Sin alias registrados</p>
      ) : (
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Texto</th>
              <th className="text-left py-2 px-3 font-medium text-muted-foreground">Creado por</th>
              <th className="py-2 px-3"></th>
            </tr>
          </thead>
          <tbody>
            {alias.map((a) => (
              <tr key={a.id} className="border-b border-border/50 hover:bg-secondary">
                <td className="py-2 px-3 font-mono text-xs">{a.texto}</td>
                <td className="py-2 px-3">
                  <Badge variant={a.creadoPor === 'SISTEMA' ? 'info' : 'default'}>
                    {a.creadoPor === 'SISTEMA' ? 'Sistema' : 'Depósito'}
                  </Badge>
                </td>
                <td className="py-2 px-3 text-right">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => eliminarAlias.mutate(a.id)}
                    disabled={eliminarAlias.isPending}
                  >
                    <Trash2 size={14} />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
