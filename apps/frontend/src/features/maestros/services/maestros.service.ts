import { api } from '@/lib/axios'
import type {
  Alias,
  CreateAliasDto,
  CreateMaterialDto,
  CreateObraDto,
  CreateObraProveedorDto,
  Material,
  MaterialConAlias,
  Obra,
  ObraProveedor,
  UpdateMaterialDto,
  UpdateObraDto,
} from '../types/maestros.types'

const getMateriales = (): Promise<Material[]> =>
  api.get('/materiales').then((r) => r.data)

const getMaterial = (id: string): Promise<MaterialConAlias> =>
  api.get(`/materiales/${id}`).then((r) => r.data)

const crearMaterial = (data: CreateMaterialDto): Promise<Material> =>
  api.post('/materiales', data).then((r) => r.data)

const actualizarMaterial = (id: string, data: UpdateMaterialDto): Promise<Material> =>
  api.patch(`/materiales/${id}`, data).then((r) => r.data)

const eliminarMaterial = (id: string): Promise<void> =>
  api.delete(`/materiales/${id}`).then((r) => r.data)

const getAlias = (materialId: string): Promise<Alias[]> =>
  api.get(`/materiales/${materialId}/alias`).then((r) => r.data)

const crearAlias = (materialId: string, data: CreateAliasDto): Promise<Alias> =>
  api.post(`/materiales/${materialId}/alias`, data).then((r) => r.data)

const eliminarAlias = (aliasId: string): Promise<void> =>
  api.delete(`/alias/${aliasId}`).then((r) => r.data)

const getObras = (): Promise<Obra[]> =>
  api.get('/obras').then((r) => r.data)

const getObra = (id: string): Promise<Obra & { proveedores: ObraProveedor[] }> =>
  api.get(`/obras/${id}`).then((r) => r.data)

const crearObra = (data: CreateObraDto): Promise<Obra> =>
  api.post('/obras', data).then((r) => r.data)

const actualizarObra = (id: string, data: UpdateObraDto): Promise<Obra> =>
  api.patch(`/obras/${id}`, data).then((r) => r.data)

const agregarProveedor = (
  obraId: string,
  data: CreateObraProveedorDto,
): Promise<ObraProveedor> =>
  api.post(`/obras/${obraId}/proveedores`, data).then((r) => r.data)

export const maestrosService = {
  getMateriales,
  getMaterial,
  crearMaterial,
  actualizarMaterial,
  eliminarMaterial,
  getAlias,
  crearAlias,
  eliminarAlias,
  getObras,
  getObra,
  crearObra,
  actualizarObra,
  agregarProveedor,
}
