import {
  IsString,
  MaxLength,
  IsBoolean,
  IsUUID,
  IsOptional,
} from 'class-validator';

export class UpdateProductoDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  nombre?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

  @IsOptional()
  @IsUUID()
  tipoProductoId?: string;
}
