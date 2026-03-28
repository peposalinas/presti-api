import { IsString, MaxLength } from 'class-validator';

export class CreateTipoProductoDto {
  @IsString()
  @MaxLength(100)
  nombre: string;
}
