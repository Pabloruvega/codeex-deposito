import { IMaterial } from './material.interface';

export type EstadoResolucion =
  | 'RESUELTO_AUTOMATICO'
  | 'PENDIENTE_CONFIRMACION'
  | 'SIN_MATCH';

export interface ICandidatoMaterial {
  material: IMaterial;
  score: number;
  aliasCoincidente: string;
}

export interface IResolverResultado {
  estado: EstadoResolucion;
  material: IMaterial | null;
  candidatos: ICandidatoMaterial[];
  score: number | null;
  textoNormalizado: string;
}
