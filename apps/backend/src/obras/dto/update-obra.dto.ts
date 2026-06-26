import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateObraDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activa?: boolean;
}
