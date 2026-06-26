import { IsString, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';
import { CategoriaMaterial, UnidadMedida } from '../interfaces/material.interface';

export class CreateMaterialDto {
  @IsOptional()
  @IsString()
  codigoProveedor?: string;

  @IsString()
  nombreOficial: string;

  @IsEnum(CategoriaMaterial)
  categoria: CategoriaMaterial;

  @IsEnum(UnidadMedida)
  unidadStock: UnidadMedida;

  @IsEnum(UnidadMedida)
  unidadPedido: UnidadMedida;

  @IsOptional()
  @IsNumber()
  @Min(0)
  longitudEstandar?: number;
}
