import { IsEnum } from 'class-validator';

export enum EstadoTransicion {
  EN_COMPRA = 'EN_COMPRA',
  RESUELTO = 'RESUELTO',
}

export class UpdateFaltanteObraDto {
  @IsEnum(EstadoTransicion, { message: 'estado debe ser EN_COMPRA o RESUELTO' })
  estado: EstadoTransicion;
}
