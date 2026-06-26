export {
  CategoriaMaterial,
  UnidadMedida,
  CreadoPorAlias,
} from '@prisma/client';

export interface IMaterial {
  id: string;
  codigoProveedor: string | null;
  nombreOficial: string;
  categoria: string;
  unidadStock: string;
  unidadPedido: string;
  longitudEstandar: number | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}

export interface IAlias {
  id: string;
  texto: string;
  materialId: string;
  creadoPor: string;
  creadoEn: Date;
}
