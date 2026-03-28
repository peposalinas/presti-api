import { IsBoolean, IsDateString, IsString } from 'class-validator';

export class CreateRecomendacionDto {
  @IsDateString()
  timestamp: string;

  @IsBoolean()
  exito: boolean;

  @IsString()
  productoId: string;

  @IsString()
  usuarioId: string;
}
