import { IsString, IsEnum, IsOptional, IsNumber, IsBoolean, Min } from 'class-validator';
import { CategoriaMaterial, UnidadMedida } from '../interfaces/material.interface';

export class UpdateMaterialDto {
  @IsOptional()
  @IsString()
  codigoProveedor?: string;

  @IsOptional()
  @IsString()
  nombreOficial?: string;

  @IsOptional()
  @IsEnum(CategoriaMaterial)
  categoria?: CategoriaMaterial;

  @IsOptional()
  @IsEnum(UnidadMedida)
  unidadStock?: UnidadMedida;

  @IsOptional()
  @IsEnum(UnidadMedida)
  unidadPedido?: UnidadMedida;

  @IsOptional()
  @IsNumber()
  @Min(0)
  longitudEstandar?: number;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;
}
