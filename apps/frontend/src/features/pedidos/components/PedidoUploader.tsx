'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'
import { useObras } from '@/features/maestros/hooks/useObras'
import { useSubirPedido } from '../hooks/useSubirPedido'

const TIPOS_ACEPTADOS = '.pdf,.jpg,.jpeg,.png'

export function PedidoUploader() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [obraId, setObraId] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { data: obras = [] } = useObras()
  const { mutate, isPending } = useSubirPedido()

  const validarArchivo = (f: File): string => {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
    if (!['pdf', 'jpg', 'jpeg', 'png'].includes(ext)) return 'Solo se aceptan PDF, JPG o PNG'
    if (f.size > 10 * 1024 * 1024) return 'El archivo no puede superar 10 MB'
    return ''
  }

  const setArchivoValidado = (f: File) => {
    const err = validarArchivo(f)
    setErrorMsg(err)
    if (!err) setFile(f)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) setArchivoValidado(dropped)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) setArchivoValidado(f)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setErrorMsg('Seleccioná un archivo'); return }
    if (!obraId) { setErrorMsg('Seleccioná una obra'); return }
    setErrorMsg('')

    const formData = new FormData()
    formData.append('archivo', file)
    formData.append('obraId', obraId)

    mutate(formData, {
      onSuccess: (pedido) => router.push(`/pedidos/${pedido.id}`),
      onError: (err) => setErrorMsg((err as Error).message),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-foreground">Nuevo pedido</h2>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? 'border-foreground bg-secondary'
            : file
              ? 'border-foreground/30 bg-secondary'
              : 'border-border hover:border-foreground/30 hover:bg-secondary'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={TIPOS_ACEPTADOS}
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? (
          <>
            <span className="text-2xl">📄</span>
            <p className="mt-2 text-sm font-medium text-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
          </>
        ) : (
          <>
            <span className="text-2xl text-muted-foreground">⬆</span>
            <p className="mt-2 text-sm text-muted-foreground">
              Arrastrá un archivo o{' '}
              <span className="font-medium text-foreground">hacé click para seleccionar</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">PDF, JPG o PNG — máx. 10 MB</p>
          </>
        )}
      </div>

      <Select
        value={obraId}
        onChange={(e) => setObraId(e.target.value)}
        className="mb-4"
      >
        <option value="">Seleccioná una obra…</option>
        {obras
          .filter((o) => o.activa)
          .map((o) => (
            <option key={o.id} value={o.id}>
              {o.nombre}
            </option>
          ))}
      </Select>

      {errorMsg && <p className="mb-3 text-xs text-destructive">{errorMsg}</p>}

      <Button type="submit" disabled={isPending || !file || !obraId} className="w-full">
        {isPending ? 'Subiendo…' : 'Subir pedido'}
      </Button>
    </form>
  )
}
