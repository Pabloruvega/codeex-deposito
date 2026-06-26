import { IsArray, IsNotEmpty, IsNumber, IsPositive, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class StockItemEntradaDto {
  @IsString()
  @IsNotEmpty()
  materialId: string;

  @IsNumber()
  @IsPositive()
  cantidad: number;
}

export class IngresoStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockItemEntradaDto)
  items: StockItemEntradaDto[];
}
