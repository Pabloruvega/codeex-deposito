'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { recepcionesService } from '@/features/recepciones/services/recepciones.service'

interface Props {
  proveedor?: string
  obraId?: string
}

export function ExportarFaltantesButton({ proveedor, obraId }: Props) {
  const [descargando, setDescargando] = useState(false)

  const handleExportar = async () => {
    setDescargando(true)
    try {
      await recepcionesService.exportarFaltantesExcel({
        ...(proveedor ? { proveedor } : {}),
        ...(obraId ? { obraId } : {}),
      })
    } finally {
      setDescargando(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExportar} disabled={descargando}>
      {descargando ? 'Descargando…' : 'Exportar Excel'}
    </Button>
  )
}
