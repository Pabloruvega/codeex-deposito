import { IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class ActualizarItemDto {
  @IsString()
  @IsUUID()
  materialId: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  confirmadoPor?: string;
}
