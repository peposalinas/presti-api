import { IsString, MaxLength, IsBoolean, IsUUID } from 'class-validator';

export class CreateProductoDto {
  @IsString()
  @MaxLength(100)
  nombre: string;

  @IsBoolean()
  activo: boolean;

  @IsUUID()
  tipoProductoId: string;
}
