import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ItemRecepcionDto {
  @IsString()
  @IsNotEmpty()
  codigoProveedor: string;

  @IsString()
  @IsNotEmpty()
  descripcionProveedor: string;

  @IsNumber()
  @Min(0)
  cantidadFacturada: number;

  @IsNumber()
  @Min(0)
  cantidadRecibida: number;
}

export class CreateRecepcionDto {
  @IsUUID()
  @IsNotEmpty()
  obraId: string;

  @IsString()
  @IsNotEmpty()
  proveedor: string;

  @IsString()
  @IsNotEmpty()
  numeroRemito: string;

  @IsString()
  @IsNotEmpty()
  numeroFactura: string;

  @IsDateString()
  fechaRemito: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemRecepcionDto)
  items: ItemRecepcionDto[];
}
