import { IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class ItemRemitoDto {
  @IsUUID()
  @IsOptional()
  materialId?: string | null;

  @IsString()
  @IsOptional()
  descripcion?: string;

  @IsNumber()
  @Min(0)
  cantidadPedida: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  cantidadFaltante?: number;

  @IsString()
  @IsOptional()
  observaciones?: string;
}
