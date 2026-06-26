import { CategoriaMaterial, UnidadMedida } from '../interfaces/material.interface';

export class MaterialEntity {
  id: string;
  codigoProveedor: string | null;
  nombreOficial: string;
  categoria: CategoriaMaterial;
  unidadStock: UnidadMedida;
  unidadPedido: UnidadMedida;
  longitudEstandar: number | null;
  activo: boolean;
  creadoEn: Date;
  actualizadoEn: Date;
}
