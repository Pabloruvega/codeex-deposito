import { CreadoPorAlias } from '../interfaces/material.interface';

export class AliasEntity {
  id: string;
  texto: string;
  materialId: string;
  creadoPor: CreadoPorAlias;
  creadoEn: Date;
}
