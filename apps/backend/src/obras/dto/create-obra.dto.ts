import { IsString, MinLength } from 'class-validator';

export class CreateObraDto {
  @IsString()
  @MinLength(1)
  nombre: string;
}
