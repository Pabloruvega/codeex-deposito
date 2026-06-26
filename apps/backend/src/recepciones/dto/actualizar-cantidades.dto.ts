import { IsArray, IsNumber, IsUUID, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class ActualizarItemDto {
  @IsUUID()
  itemId: string;

  @IsNumber()
  @Min(0)
  cantidadRecibida: number;
}

export class ActualizarCantidadesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActualizarItemDto)
  items: ActualizarItemDto[];
}
