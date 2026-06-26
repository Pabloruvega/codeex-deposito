import { IsArray, IsUUID } from 'class-validator';

export class ResolverFaltantesDto {
  @IsArray()
  @IsUUID(undefined, { each: true })
  faltanteIds: string[];
}
