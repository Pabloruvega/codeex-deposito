import { IsString, MinLength } from 'class-validator';

export class CreateObraProveedorDto {
  @IsString()
  @MinLength(1)
  proveedor: string;

  @IsString()
  @MinLength(1)
  spreadsheetIdStock: string;

  @IsString()
  @MinLength(1)
  spreadsheetIdControl: string;
}
