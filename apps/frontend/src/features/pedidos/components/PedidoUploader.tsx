'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { useObras } from '@/features/maestros/hooks/useObras'
import { useSubirPedido } from '../hooks/useSubirPedido'
import { useRemitoDirecto } from '../hooks/useRemitoDirecto'

const TIPOS_ACEPTADOS = '.pdf,.jpg,.jpeg,.png'

type Modo = 'revisar' | 'directo'

export function PedidoUploader() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [obraId, setObraId] = useState('')
  const [modo, setModo] = useState<Modo>('revisar')
  const [encargadoDeposito, setEncargadoDeposito] = useState('')
  const [encargadoTraslado, setEncargadoTraslado] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const { data: obras = [] } = useObras()
  const { mutate: subirPedido, isPending: isPendingSubir } = useSubirPedido()
  const { mutate: remitoDirecto, isPending: isPendingDirecto } = useRemitoDirecto()

  const isPending = isPendingSubir || isPendingDirecto

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

  const handleSubmitRevisar = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setErrorMsg('Seleccioná un archivo'); return }
    if (!obraId) { setErrorMsg('Seleccioná una obra'); return }
    setErrorMsg('')

    const formData = new FormData()
    formData.append('archivo', file)
    formData.append('obraId', obraId)

    subirPedido(formData, {
      onSuccess: (pedido) => router.push(`/pedidos/${pedido.id}`),
      onError: (err) => setErrorMsg((err as Error).message),
    })
  }

  const handleSubmitDirecto = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) { setErrorMsg('Seleccioná un archivo'); return }
    if (!obraId) { setErrorMsg('Seleccioná una obra'); return }
    if (!encargadoDeposito.trim()) { setErrorMsg('Ingresá el encargado de depósito'); return }
    if (!encargadoTraslado.trim()) { setErrorMsg('Ingresá el encargado de traslado'); return }
    setErrorMsg('')

    const formData = new FormData()
    formData.append('archivo', file)
    formData.append('obraId', obraId)
    formData.append('encargadoDeposito', encargadoDeposito.trim())
    formData.append('encargadoTraslado', encargadoTraslado.trim())

    remitoDirecto(formData, {
      onError: (err) => setErrorMsg((err as Error).message),
    })
  }

  const cambiarModo = (nuevoModo: Modo) => {
    setModo(nuevoModo)
    setErrorMsg('')
  }

  const dropZoneClass = `mb-4 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
    isDragging
      ? 'border-foreground bg-secondary'
      : file
        ? 'border-foreground/30 bg-secondary'
        : 'border-border hover:border-foreground/30 hover:bg-secondary'
  }`

  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h2 className="mb-4 text-sm font-semibold text-foreground">Nuevo pedido</h2>

      {/* Selector de modo */}
      <div className="mb-5 flex gap-2 rounded-lg border border-border p-1">
        <button
          type="button"
          onClick={() => cambiarModo('revisar')}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
            modo === 'revisar'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Subir y revisar ítems
        </button>
        <button
          type="button"
          onClick={() => cambiarModo('directo')}
          className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
            modo === 'directo'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Generar remito directo
        </button>
      </div>

      <form onSubmit={modo === 'revisar' ? handleSubmitRevisar : handleSubmitDirecto}>
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragEnter={() => setIsDragging(true)}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => fileInputRef.current?.click()}
          className={dropZoneClass}
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

        {/* Selector de obra */}
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

        {/* Campos extra para modo directo */}
        {modo === 'directo' && (
          <div className="mb-4 space-y-3">
            <Input
              placeholder="Encargado de depósito"
              value={encargadoDeposito}
              onChange={(e) => setEncargadoDeposito(e.target.value)}
            />
            <Input
              placeholder="Encargado de traslado"
              value={encargadoTraslado}
              onChange={(e) => setEncargadoTraslado(e.target.value)}
            />
          </div>
        )}

        {errorMsg && <p className="mb-3 text-xs text-destructive">{errorMsg}</p>}

        {modo === 'revisar' ? (
          <Button type="submit" disabled={isPending || !file || !obraId} className="w-full">
            {isPendingSubir ? 'Subiendo…' : 'Subir y revisar ítems'}
          </Button>
        ) : (
          <Button type="submit" disabled={isPending || !file || !obraId} className="w-full">
            {isPendingDirecto ? 'Generando remito…' : 'Generar remito directo'}
          </Button>
        )}
      </form>
    </div>
  )
}
