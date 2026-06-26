import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { StockItemEntradaDto } from './stock-item.dto';

export class DescuentoStockDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StockItemEntradaDto)
  items: StockItemEntradaDto[];

  @IsString()
  @IsNotEmpty()
  numeroRemito: string;
}
