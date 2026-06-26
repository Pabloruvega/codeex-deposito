import { IsString } from 'class-validator';
import { EstadoResolucion } from '../interfaces/resolver-resultado.interface';

export class ResolverTextoDto {
  @IsString()
  texto: string;
}

export class CandidatoMaterialDto {
  materialId: string;
  nombreOficial: string;
  score: number;
  aliasCoincidente: string;
}

export class ResolverResultadoDto {
  estado: EstadoResolucion;
  materialId: string | null;
  nombreOficial: string | null;
  candidatos: CandidatoMaterialDto[];
  score: number | null;
  textoNormalizado: string;
}
