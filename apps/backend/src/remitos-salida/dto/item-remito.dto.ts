import { IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class ItemRemitoDto {
  @IsUUID()
  @IsNotEmpty()
  materialId: string;

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
