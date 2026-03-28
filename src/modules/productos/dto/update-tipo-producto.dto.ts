import { IsString, MaxLength, IsOptional } from 'class-validator';

export class UpdateTipoProductoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;
}
