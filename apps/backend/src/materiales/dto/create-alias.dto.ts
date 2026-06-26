import { IsString, IsEnum, IsOptional } from 'class-validator';
import { CreadoPorAlias } from '../interfaces/material.interface';

export class CreateAliasDto {
  @IsString()
  texto: string;

  @IsOptional()
  @IsEnum(CreadoPorAlias)
  creadoPor?: CreadoPorAlias;
}
