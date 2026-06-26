import { IsArray, IsDateString, IsNotEmpty, IsString, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ItemRemitoDto } from './item-remito.dto';

export class CreateRemitoDto {
  @IsUUID()
  @IsNotEmpty()
  pedidoId: string;

  @IsString()
  @IsNotEmpty()
  encargadoDeposito: string;

  @IsString()
  @IsNotEmpty()
  encargadoTraslado: string;

  @IsDateString()
  fechaRetiroDeposito: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ItemRemitoDto)
  items: ItemRemitoDto[];
}
