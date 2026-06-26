import { IsString, IsUUID } from 'class-validator';

export class CreatePedidoDto {
  @IsString()
  @IsUUID()
  obraId: string;
}
