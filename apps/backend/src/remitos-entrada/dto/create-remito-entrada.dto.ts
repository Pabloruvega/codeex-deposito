import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemRemitoEntradaDto {
  @IsString()
  @IsNotEmpty()
  codigoProveedor: string;

  @IsString()
  @IsNotEmpty()
  descripcionProveedor: string;

  @IsNumber()
  @Min(0)
  cantidad: number;

  @IsString()
  @IsOptional()
  unidad?: string;
}

export class CreateRemitoEntradaDto {
  @IsUUID()
  @IsNotEmpty()
  obraId: string;

  @IsString()
  @IsNotEmpty()
  proveedor: string;

  @IsString()
  @IsNotEmpty()
  numeroRemito: string;

  @IsDateString()
  fechaRemito: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemRemitoEntradaDto)
  items: ItemRemitoEntradaDto[];
}
