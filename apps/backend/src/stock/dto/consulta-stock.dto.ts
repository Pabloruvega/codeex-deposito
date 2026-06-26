import { IsOptional, IsString } from 'class-validator';

export class ConsultaStockDto {
  @IsOptional()
  @IsString()
  proveedor?: string;
}
