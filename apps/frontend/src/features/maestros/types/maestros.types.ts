export type CategoriaMaterial =
  | 'CANO_AGUA'
  | 'CANO_CLOACA'
  | 'CANO_GAS'
  | 'CANO_ELECTRICO'
  | 'ACCESORIO_PLOMERIA'
  | 'VALVULA'
  | 'TANQUE'
  | 'HERRAMIENTA'
  | 'OTRO'

export type UnidadMedida = 'UNIDAD' | 'METRO'

export type CreadoPorAlias = 'SISTEMA' | 'DEPOSITO'

export interface Material {
  id: string
  codigoProveedor: string | null
  nombreOficial: string
  categoria: CategoriaMaterial
  unidadStock: UnidadMedida
  unidadPedido: UnidadMedida
  longitudEstandar: number | null
  activo: boolean
  creadoEn: string
  actualizadoEn: string
}

export interface MaterialConAlias extends Material {
  alias: Alias[]
}

export interface Alias {
  id: string
  texto: string
  materialId: string
  creadoPor: CreadoPorAlias
  creadoEn: string
}

export interface ObraProveedor {
  id: string
  obraId: string
  proveedor: string
  spreadsheetIdStock: string
  spreadsheetIdControl: string
  activo: boolean
}

export interface Obra {
  id: string
  nombre: string
  activa: boolean
  creadoEn: string
  proveedores?: ObraProveedor[]
}

export interface CreateMaterialDto {
  codigoProveedor?: string
  nombreOficial: string
  categoria: CategoriaMaterial
  unidadStock: UnidadMedida
  unidadPedido: UnidadMedida
  longitudEstandar?: number | null
}

export interface UpdateMaterialDto extends Partial<CreateMaterialDto> {
  activo?: boolean
}

export interface CreateObraDto {
  nombre: string
}

export interface UpdateObraDto {
  nombre?: string
  activa?: boolean
}

export interface CreateObraProveedorDto {
  proveedor: string
  spreadsheetIdStock: string
  spreadsheetIdControl: string
}

export interface CreateAliasDto {
  texto: string
}

export const CATEGORIAS: { value: CategoriaMaterial; label: string }[] = [
  { value: 'CANO_AGUA', label: 'Caño agua' },
  { value: 'CANO_CLOACA', label: 'Caño cloaca' },
  { value: 'CANO_GAS', label: 'Caño gas' },
  { value: 'CANO_ELECTRICO', label: 'Caño eléctrico' },
  { value: 'ACCESORIO_PLOMERIA', label: 'Accesorio plomería' },
  { value: 'VALVULA', label: 'Válvula' },
  { value: 'TANQUE', label: 'Tanque' },
  { value: 'HERRAMIENTA', label: 'Herramienta' },
  { value: 'OTRO', label: 'Otro' },
]

export const UNIDADES: { value: UnidadMedida; label: string }[] = [
  { value: 'UNIDAD', label: 'Unidad' },
  { value: 'METRO', label: 'Metro' },
]

export const CATEGORIAS_CON_LONGITUD: CategoriaMaterial[] = [
  'CANO_CLOACA',
  'CANO_GAS',
  'CANO_ELECTRICO',
]
