import { IsOptional, IsString, MinLength } from 'class-validator';

export class ConfirmarPedidoDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  confirmadoPor?: string;
}
